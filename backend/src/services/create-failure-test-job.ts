import { prisma } from "../database/prisma.js";
import { emailQueue } from "../queues/email.queue.js";

async function createFailureTestJob() {
  console.log("Creating ReachInbox failure test job...");

  /*
   * 1. Find our existing demo user
   */
  const user = await prisma.user.findUnique({
    where: {
      email: "demo@reachinbox.local",
    },
  });

  if (!user) {
    throw new Error(
      "Demo user not found. Run create-test-job.ts first."
    );
  }

  console.log("User:", user.id);

  /*
   * 2. Use an intentionally invalid SMTP configuration.
   *
   * This is ONLY for testing BullMQ retries.
   */
  const sender = await prisma.sender.create({
    data: {
      userId: user.id,
      name: "ReachInbox Failure Test",
      email: "failure-test@example.com",

      smtpHost: "invalid.smtp.server",
      smtpPort: 587,
      smtpUser: "invalid-user",
      smtpPass: "invalid-password",

      hourlyLimit: 200,
    },
  });

  console.log("Failure-test sender:", sender.id);

  /*
   * 3. Create campaign
   */
  const startAt = new Date(
    Date.now() + 5000
  );

  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,

      subject: "ReachInbox Retry Test",

      body:
        "This email intentionally fails to test BullMQ retries.",

      startAt,

      delaySeconds: 2,

      hourlyLimit: 200,

      status: "SCHEDULED",
    },
  });

  console.log("Campaign:", campaign.id);

  /*
   * 4. Create EmailJob
   */
  const recipientEmail =
    "retry-test@example.com";

  const idempotencyKey =
    `campaign:${campaign.id}:recipient:${recipientEmail}`;

  const emailJob = await prisma.emailJob.create({
    data: {
      campaignId: campaign.id,

      senderId: sender.id,

      recipientEmail,

      subject: campaign.subject,

      body: campaign.body,

      scheduledAt: startAt,

      status: "PENDING",

      idempotencyKey,
    },
  });

  console.log("EmailJob:", emailJob.id);

  /*
   * 5. Add BullMQ delayed job
   */
  const delay = Math.max(
    startAt.getTime() - Date.now(),
    1000
  );

  const bullJob = await emailQueue.add(
    "scheduled-email",
    {
      emailJobId: emailJob.id,
    },
    {
      delay,
      jobId: emailJob.id,
    }
  );

  /*
   * 6. Save BullMQ job ID
   */
  await prisma.emailJob.update({
    where: {
      id: emailJob.id,
    },

    data: {
      bullmqJobId: String(bullJob.id),
    },
  });

  console.log("");
  console.log("======================================");
  console.log("FAILURE TEST JOB CREATED");
  console.log("======================================");
  console.log("Campaign ID:", campaign.id);
  console.log("EmailJob ID:", emailJob.id);
  console.log("BullMQ Job ID:", bullJob.id);
  console.log("Scheduled:", startAt.toISOString());
  console.log("======================================");
}

createFailureTestJob()
  .catch((error) => {
    console.error(
      "Failed to create failure test job:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await emailQueue.close();
  });