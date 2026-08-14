import { prisma } from "../database/prisma.js";
import { emailQueue } from "../queues/email.queue.js";
import nodemailer from "nodemailer";

async function createTestJob() {
  console.log("Creating ReachInbox test job...");

  /*
   * 1. Create or reuse test user
   */
  const user = await prisma.user.upsert({
    where: {
      email: "demo@reachinbox.local",
    },
    update: {},
    create: {
      googleId: "demo-google-id",
      name: "ReachInbox Demo User",
      email: "demo@reachinbox.local",
    },
  });

  console.log("User:", user.id);

  /*
   * 2. Create a fresh Ethereal account
   */
  const ethereal = await nodemailer.createTestAccount();

  console.log("Ethereal account created.");

  /*
   * 3. Create sender
   */
  const sender = await prisma.sender.upsert({
    where: {
      userId_email: {
        userId: user.id,
        email: ethereal.user,
      },
    },
    update: {
      smtpHost: ethereal.smtp.host,
      smtpPort: ethereal.smtp.port,
      smtpUser: ethereal.user,
      smtpPass: ethereal.pass,
    },
    create: {
      userId: user.id,
      name: "ReachInbox Demo",
      email: ethereal.user,
      smtpHost: ethereal.smtp.host,
      smtpPort: ethereal.smtp.port,
      smtpUser: ethereal.user,
      smtpPass: ethereal.pass,
      hourlyLimit: 200,
    },
  });

  console.log("Sender:", sender.id);
  console.log("Sender email:", sender.email);

  /*
   * 4. Schedule campaign a few seconds in the future.
   */
  const startAt = new Date(Date.now() + 30000);

  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      subject: "ReachInbox Scheduler Test",
      body:
        "This email was scheduled by the ReachInbox full-stack email scheduler.",
      startAt,
      delaySeconds: 2,
      hourlyLimit: 200,
      status: "SCHEDULED",
    },
  });

  console.log("Campaign:", campaign.id);
  console.log("Scheduled at:", startAt.toISOString());

  /*
   * 5. Create individual EmailJob
   */
  const recipientEmail = "recipient@example.com";

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
   * 6. Add delayed BullMQ job.
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
   * 7. Save BullMQ job ID in PostgreSQL.
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
  console.log("TEST EMAIL SCHEDULED SUCCESSFULLY");
  console.log("======================================");
  console.log("EmailJob ID:", emailJob.id);
  console.log("BullMQ Job ID:", bullJob.id);
  console.log("Recipient:", recipientEmail);
  console.log("Scheduled:", startAt.toISOString());
  console.log("Delay:", `${delay}ms`);
  console.log("======================================");
}

createTestJob()
  .catch((error) => {
    console.error("Failed to create test job:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await emailQueue.close();
  });