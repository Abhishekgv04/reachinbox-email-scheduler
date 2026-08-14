import { prisma } from "../database/prisma.js";

export async function getEmailJobById(id: string) {
  return prisma.emailJob.findUnique({
    where: {
      id,
    },
    include: {
      sender: true,
      campaign: true,
    },
  });
}

/*
 * Atomically claim a pending EmailJob.
 *
 * PENDING → PROCESSING
 *
 * Attempts are incremented here so every actual
 * processing attempt is recorded.
 */
export async function claimEmailJob(id: string) {
  const result = await prisma.emailJob.updateMany({
    where: {
      id,
      status: "PENDING",
    },
    data: {
      status: "PROCESSING",
      attempts: {
        increment: 1,
      },
    },
  });

  return result.count === 1;
}

/*
 * Put a job back into PENDING so BullMQ can retry it.
 */
export async function resetEmailJobToPending(
  id: string,
  errorMessage?: string
) {
  return prisma.emailJob.update({
    where: {
      id,
    },
    data: {
      status: "PENDING",
      errorMessage: errorMessage ?? null,
    },
  });
}

/*
 * Successfully sent.
 *
 * PROCESSING → SENT
 */
export async function markEmailJobSent(
  id: string,
  messageId: string
) {
  return prisma.emailJob.update({
    where: {
      id,
    },
    data: {
      status: "SENT",
      sentAt: new Date(),
      errorMessage: null,
    },
  });
}

/*
 * Permanently failed after all retries.
 *
 * PROCESSING → FAILED
 */
export async function markEmailJobFailed(
  id: string,
  errorMessage: string
) {
  return prisma.emailJob.update({
    where: {
      id,
    },
    data: {
      status: "FAILED",
      errorMessage,
    },
  });
}