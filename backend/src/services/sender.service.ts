import { prisma } from "../database/prisma.js";

interface CreateSenderInput {
  userId: string;
  name: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  hourlyLimit?: number;
}

interface UpdateSenderInput {
  name?: string;
  email?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  hourlyLimit?: number;
}

/*
 * Create a new sending account.
 *
 * smtpPass is stored in PostgreSQL because the email worker
 * needs it to authenticate with the SMTP server.
 *
 * smtpPass is NEVER returned to the frontend.
 */
export async function createSender(
  input: CreateSenderInput
) {
  if (
    !input.userId ||
    !input.name ||
    !input.email ||
    !input.smtpHost ||
    !input.smtpPort ||
    !input.smtpUser ||
    !input.smtpPass
  ) {
    throw new Error("All sender fields are required");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingSender = await prisma.sender.findUnique({
    where: {
      userId_email: {
        userId: input.userId,
        email: input.email,
      },
    },
  });

  if (existingSender) {
    throw new Error(
      "A sender with this email already exists"
    );
  }

  const sender = await prisma.sender.create({
    data: {
      userId: input.userId,
      name: input.name,
      email: input.email,
      smtpHost: input.smtpHost,
      smtpPort: Number(input.smtpPort),
      smtpUser: input.smtpUser,
      smtpPass: input.smtpPass,
      hourlyLimit:
        Number(input.hourlyLimit) || 200,
    },
  });

  return {
    id: sender.id,
    userId: sender.userId,
    name: sender.name,
    email: sender.email,
    smtpHost: sender.smtpHost,
    smtpPort: sender.smtpPort,
    smtpUser: sender.smtpUser,
    hourlyLimit: sender.hourlyLimit,
    createdAt: sender.createdAt,
    updatedAt: sender.updatedAt,
  };
}

/*
 * Get all senders belonging to a user.
 *
 * smtpPass is intentionally excluded.
 */
export async function getSenders(
  userId: string
) {
  return prisma.sender.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      hourlyLimit: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/*
 * Get one sender.
 *
 * smtpPass is intentionally excluded.
 */
export async function getSenderById(
  senderId: string,
  userId: string
) {
  return prisma.sender.findFirst({
    where: {
      id: senderId,
      userId,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      hourlyLimit: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/*
 * Get SMTP credentials for INTERNAL backend use only.
 *
 * Never return this result directly from an API controller.
 */
export async function getSenderSmtpCredentials(
  senderId: string,
  userId: string
) {
  return prisma.sender.findFirst({
    where: {
      id: senderId,
      userId,
    },
    select: {
      id: true,
      smtpHost: true,
      smtpPort: true,
      smtpUser: true,
      smtpPass: true,
    },
  });
}

/*
 * Update an existing sender.
 *
 * smtpPass is stored internally but NEVER returned
 * to the frontend.
 *
 * If smtpPass is not provided or is empty,
 * the existing password is preserved.
 */
export async function updateSender(
  senderId: string,
  userId: string,
  input: UpdateSenderInput
) {
  const existingSender =
    await prisma.sender.findFirst({
      where: {
        id: senderId,
        userId,
      },
    });

  if (!existingSender) {
    throw new Error("Sender not found");
  }

  /*
   * Check for duplicate email.
   */
  if (
    input.email !== undefined &&
    input.email !== existingSender.email
  ) {
    const duplicateSender =
      await prisma.sender.findUnique({
        where: {
          userId_email: {
            userId,
            email: input.email,
          },
        },
      });

    if (duplicateSender) {
      throw new Error(
        "A sender with this email already exists"
      );
    }
  }

  /*
   * Build update object.
   */
  const updateData: UpdateSenderInput = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.email !== undefined) {
    updateData.email = input.email;
  }

  if (input.smtpHost !== undefined) {
    updateData.smtpHost = input.smtpHost;
  }

  if (input.smtpPort !== undefined) {
    updateData.smtpPort = Number(
      input.smtpPort
    );
  }

  if (input.smtpUser !== undefined) {
    updateData.smtpUser = input.smtpUser;
  }

  /*
   * Only update SMTP password when a new
   * non-empty password is supplied.
   */
  if (
    input.smtpPass !== undefined &&
    input.smtpPass.trim() !== ""
  ) {
    updateData.smtpPass = input.smtpPass;
  }

  if (input.hourlyLimit !== undefined) {
    updateData.hourlyLimit = Number(
      input.hourlyLimit
    );
  }

  /*
   * Prevent an empty update.
   */
  if (Object.keys(updateData).length === 0) {
    throw new Error(
      "At least one field is required to update"
    );
  }

  const updatedSender =
    await prisma.sender.update({
      where: {
        id: existingSender.id,
      },
      data: updateData,
    });

  /*
   * Safe response.
   *
   * smtpPass is NEVER returned.
   */
  return {
    id: updatedSender.id,
    userId: updatedSender.userId,
    name: updatedSender.name,
    email: updatedSender.email,
    smtpHost: updatedSender.smtpHost,
    smtpPort: updatedSender.smtpPort,
    smtpUser: updatedSender.smtpUser,
    hourlyLimit:
      updatedSender.hourlyLimit,
    createdAt: updatedSender.createdAt,
    updatedAt: updatedSender.updatedAt,
  };
}

/*
 * Delete a sender.
 *
 * A sender cannot be deleted if EmailJobs
 * are still referencing it because the Prisma
 * relation uses onDelete: Restrict.
 */
export async function deleteSender(
  senderId: string,
  userId: string
) {
  const sender =
    await prisma.sender.findFirst({
      where: {
        id: senderId,
        userId,
      },
    });

  if (!sender) {
    throw new Error("Sender not found");
  }

  try {
    await prisma.sender.delete({
      where: {
        id: sender.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Delete sender database error:",
      error
    );

    throw new Error(
      "Sender cannot be deleted because it is being used by email jobs"
    );
  }
}