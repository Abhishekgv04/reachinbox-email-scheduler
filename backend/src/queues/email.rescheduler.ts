import { emailQueue } from "./email.queue.js";

export async function rescheduleEmailJob(
  emailJobId: string,
  retryAt: Date
): Promise<string> {
  const delay = Math.max(
    retryAt.getTime() - Date.now(),
    1000
  );

  const job = await emailQueue.add(
    "scheduled-email",
    {
      emailJobId,
    },
    {
      delay,

      /*
       * Use the database EmailJob ID as the BullMQ job ID.
       *
       * This helps us avoid accidentally creating
       * duplicate BullMQ jobs.
       */
      jobId: emailJobId,
    }
  );

  return job.id!;
}