import { prisma } from "../database/prisma.js";
import { emailQueue } from "../queues/email.queue.js";

interface CreateCampaignInput {
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  startAt: string;
  delaySeconds: number;
  hourlyLimit: number;
  recipients: string[];
}

/*
 * Create a new campaign and its EmailJobs.
 */
export async function createCampaign(
  input: CreateCampaignInput
) {
  if (input.recipients.length === 0) {
    throw new Error("At least one recipient is required");
  }

  const sender = await prisma.sender.findFirst({
    where: {
      id: input.senderId,
      userId: input.userId,
    },
  });

  if (!sender) {
    throw new Error("Sender not found");
  }

  const startAt = new Date(input.startAt);

  if (Number.isNaN(startAt.getTime())) {
    throw new Error("Invalid startAt");
  }

  if (startAt.getTime() < Date.now()) {
    throw new Error("startAt must be in the future");
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId: input.userId,
      subject: input.subject,
      body: input.body,
      startAt,
      delaySeconds: input.delaySeconds,
      hourlyLimit: input.hourlyLimit,
      status: "DRAFT",
    },
  });

  try {
    await prisma.emailJob.createMany({
      data: input.recipients.map((recipient) => ({
        campaignId: campaign.id,
        senderId: input.senderId,
        recipientEmail: recipient,
        subject: input.subject,
        body: input.body,
        scheduledAt: startAt,
        status: "PENDING",
        idempotencyKey:
          `campaign:${campaign.id}:recipient:${recipient}`,
      })),
    });
  } catch (error) {
    await prisma.campaign.delete({
      where: {
        id: campaign.id,
      },
    });

    throw error;
  }

  return prisma.campaign.findUnique({
    where: {
      id: campaign.id,
    },
    include: {
      emailJobs: true,
      user: true,
    },
  });
}


/*
 * Get all campaigns belonging to a user.
 */
export async function getCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: {
      userId,
    },
    include: {
      emailJobs: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


/*
 * Get a single campaign belonging to a user.
 */
export async function getCampaignById(
  campaignId: string,
  userId: string
) {
  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
    },
    include: {
      emailJobs: {
        orderBy: {
          createdAt: "asc",
        },
      },
      user: true,
    },
  });
}


/*
 * Start a campaign.
 *
 * DRAFT → SCHEDULED
 */
export async function startCampaign(
  campaignId: string,
  userId: string
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
    },
    include: {
      emailJobs: true,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (campaign.status !== "DRAFT") {
    throw new Error(
      `Campaign cannot be started from ${campaign.status} state`
    );
  }

  await prisma.campaign.update({
    where: {
      id: campaign.id,
    },
    data: {
      status: "SCHEDULED",
    },
  });

  for (const emailJob of campaign.emailJobs) {
    const delay = Math.max(
      emailJob.scheduledAt.getTime() - Date.now(),
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

    await prisma.emailJob.update({
      where: {
        id: emailJob.id,
      },
      data: {
        bullmqJobId: String(bullJob.id),
      },
    });
  }

  return prisma.campaign.findUnique({
    where: {
      id: campaign.id,
    },
    include: {
      emailJobs: true,
    },
  });
}


/*
 * Update campaign status based on EmailJob states.
 *
 * This is called after an email is sent or fails.
 */
export async function updateCampaignStatus(
  campaignId: string
) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
    include: {
      emailJobs: true,
    },
  });

  if (!campaign) {
    return null;
  }

  /*
   * Don't modify campaigns that have been
   * explicitly cancelled.
   */
  if (campaign.status === "CANCELLED") {
    return campaign;
  }

  const emailJobs = campaign.emailJobs;

  if (emailJobs.length === 0) {
    return campaign;
  }

  const sentCount = emailJobs.filter(
    (job) => job.status === "SENT"
  ).length;

  const failedCount = emailJobs.filter(
    (job) => job.status === "FAILED"
  ).length;

  const processingCount = emailJobs.filter(
    (job) => job.status === "PROCESSING"
  ).length;

  const pendingCount = emailJobs.filter(
    (job) => job.status === "PENDING"
  ).length;

  let newStatus = campaign.status;

  /*
   * All emails successfully sent.
   */
  if (sentCount === emailJobs.length) {
    newStatus = "COMPLETED";
  }

  /*
   * At least one email is currently being processed.
   */
  else if (processingCount > 0 || sentCount > 0) {
    newStatus = "PROCESSING";
  }

  /*
   * All remaining jobs have failed.
   */
  else if (
    failedCount > 0 &&
    pendingCount === 0 &&
    processingCount === 0
  ) {
    newStatus = "FAILED";
  }

  /*
   * Only update the database when the status changed.
   */
  if (newStatus !== campaign.status) {
    return prisma.campaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        status: newStatus,
      },
      include: {
        emailJobs: true,
      },
    });
  }

  return campaign;
}


/*
 * Cancel a campaign.
 */
export async function cancelCampaign(
  campaignId: string,
  userId: string
) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
    },
    include: {
      emailJobs: true,
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (
    campaign.status === "COMPLETED" ||
    campaign.status === "CANCELLED"
  ) {
    throw new Error(
      `Campaign cannot be cancelled from ${campaign.status} state`
    );
  }

  for (const emailJob of campaign.emailJobs) {
    if (emailJob.bullmqJobId) {
      const bullJob = await emailQueue.getJob(
        emailJob.bullmqJobId
      );

      if (bullJob) {
        await bullJob.remove().catch(() => {});
      }
    }
  }

  await prisma.emailJob.updateMany({
    where: {
      campaignId: campaign.id,
      status: "PENDING",
    },
    data: {
      status: "CANCELLED",
    },
  });

  return prisma.campaign.update({
    where: {
      id: campaign.id,
    },
    data: {
      status: "CANCELLED",
    },
    include: {
      emailJobs: true,
    },
  });
}