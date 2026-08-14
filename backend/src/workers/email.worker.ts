import { Worker, Job } from "bullmq";

import { redisConnection } from "../config/redis.js";
import { env } from "../config/env.js";

import {
  EMAIL_QUEUE_NAME,
  EmailJobData,
} from "../queues/email.queue.js";

import {
  getEmailJobById,
  claimEmailJob,
  markEmailJobSent,
  markEmailJobFailed,
  resetEmailJobToPending,
} from "../services/email-job.service.js";

import { updateCampaignStatus } from "../services/campaign.service.js";

import { checkAndConsumeRateLimit } from "../services/rate-limit.service.js";
import { waitForSendSlot } from "../services/send-spacing.service.js";
import { sendEmail } from "../services/email.service.js";

import { rescheduleEmailJob } from "../queues/email.rescheduler.js";

const worker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,

  async (job: Job<EmailJobData>) => {
    const emailJobId = job.data.emailJobId;

    console.log(`Processing EmailJob ${emailJobId}`);

    /*
     * 1. Get EmailJob from PostgreSQL
     */
    const emailJob = await getEmailJobById(emailJobId);

    if (!emailJob) {
      throw new Error(`EmailJob ${emailJobId} not found`);
    }

    /*
     * 2. Idempotency protection
     *
     * Never send an email that has already been sent.
     */
    if (emailJob.status === "SENT") {
      console.log(
        `EmailJob ${emailJobId} already sent. Skipping.`
      );

      return {
        skipped: true,
        reason: "already-sent",
      };
    }

    /*
     * 3. Atomically claim the EmailJob.
     *
     * PENDING → PROCESSING
     */
    const claimed = await claimEmailJob(emailJobId);

    if (!claimed) {
      console.log(
        `EmailJob ${emailJobId} was already claimed by another worker.`
      );

      return {
        skipped: true,
        reason: "already-claimed",
      };
    }

    /*
     * 4. Check sender hourly rate limit.
     */
    const rateLimit = await checkAndConsumeRateLimit(
      emailJob.senderId,
      emailJob.campaign.hourlyLimit || env.email.maxPerHour
    );

    /*
     * 5. Rate limit exceeded.
     */
    if (!rateLimit.allowed) {
      const retryAt = rateLimit.retryAt;

      if (!retryAt) {
        await resetEmailJobToPending(emailJobId);

        throw new Error(
          "Rate limit exceeded without retry time"
        );
      }

      console.log(
        `Rate limit reached for EmailJob ${emailJobId}.`
      );

      console.log(
        `Rescheduling for: ${retryAt.toISOString()}`
      );

      await resetEmailJobToPending(emailJobId);

      await rescheduleEmailJob(
        emailJobId,
        retryAt
      );

      return {
        rescheduled: true,
        emailJobId,
        retryAt: retryAt.toISOString(),
      };
    }

    /*
     * 6. Wait for distributed send slot.
     */
    await waitForSendSlot();

    /*
     * 7. Send email.
     */
    try {
      const result = await sendEmail(
        emailJob.sender,
        emailJob.recipientEmail,
        emailJob.subject,
        emailJob.body
      );

      /*
       * 8. Mark EmailJob as SENT.
       */
      await markEmailJobSent(
        emailJobId,
        result.messageId
      );

      /*
       * Update parent campaign.
       *
       * If all EmailJobs are SENT,
       * campaign becomes COMPLETED.
       */
      await updateCampaignStatus(
        emailJob.campaignId
      );

      console.log(
        `EmailJob ${emailJobId} sent successfully.`
      );

      if (result.previewUrl) {
        console.log(
          `Preview: ${result.previewUrl}`
        );
      }

      return {
        success: true,
        emailJobId,
        messageId: result.messageId,
        previewUrl: result.previewUrl,
      };
    } catch (error) {
      /*
       * 9. SMTP failure.
       *
       * BullMQ has attempts: 3.
       *
       * We only mark the EmailJob as FAILED
       * when the FINAL attempt has failed.
       */

      const message =
        error instanceof Error
          ? error.message
          : "Unknown email sending error";

      const maxAttempts =
        job.opts.attempts ?? 1;

      /*
       * BullMQ's attemptsMade represents
       * attempts completed before the current retry.
       */
      const currentAttempt =
        job.attemptsMade + 1;

      const isFinalAttempt =
        currentAttempt >= maxAttempts;

      if (isFinalAttempt) {
        /*
         * No retries remain.
         *
         * PROCESSING → FAILED
         */
        await markEmailJobFailed(
          emailJobId,
          message
        );

        await updateCampaignStatus(
          emailJob.campaignId
        );

        console.error(
          `EmailJob ${emailJobId} permanently failed after ${currentAttempt} attempt(s).`
        );
      } else {
        /*
         * Retries remain.
         *
         * PROCESSING → PENDING
         *
         * BullMQ will retry the job.
         */
        await resetEmailJobToPending(
          emailJobId,
          message
        );

        console.log(
          `EmailJob ${emailJobId} failed on attempt ${currentAttempt}. ` +
          `BullMQ will retry.`
        );
      }

      /*
       * Throw the error so BullMQ performs
       * its configured retry behavior.
       */
      throw error;
    }
  },

  {
    connection: redisConnection,
    concurrency: env.worker.concurrency,
  }
);

/*
 * Worker events
 */

worker.on("completed", (job) => {
  console.log(
    `Email job ${job.id} completed`
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Email job ${job?.id} failed:`,
    error.message
  );
});

worker.on("error", (error) => {
  console.error(
    "Worker error:",
    error
  );
});

console.log(
  `Email worker started with concurrency: ${env.worker.concurrency}`
);