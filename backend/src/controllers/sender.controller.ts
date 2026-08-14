import { Request, Response } from "express";

import {
  createSender,
  getSenders,
  getSenderById,
  getSenderSmtpCredentials,
  updateSender,
  deleteSender,
} from "../services/sender.service.js";

import { testSmtpConnection } from "../services/smtp.service.js";

/*
 * POST /api/senders
 *
 * Create a new sending account.
 */
export async function createSenderController(
  req: Request,
  res: Response
) {
  try {
    const {
      userId,
      name,
      email,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      hourlyLimit,
    } = req.body;

    if (
      !userId ||
      !name ||
      !email ||
      !smtpHost ||
      !smtpPort ||
      !smtpUser ||
      !smtpPass
    ) {
      return res.status(400).json({
        success: false,
        message: "All sender fields are required",
      });
    }

    const sender = await createSender({
      userId,
      name,
      email,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPass,
      hourlyLimit:
        Number(hourlyLimit) || 200,
    });

    return res.status(201).json({
      success: true,
      message: "Sender created successfully",
      sender,
    });
  } catch (error) {
    console.error(
      "Create sender error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create sender",
    });
  }
}

/*
 * GET /api/senders?userId=...
 *
 * Get all senders belonging to a user.
 *
 * smtpPass is never returned.
 */
export async function getSendersController(
  req: Request,
  res: Response
) {
  try {
    const userId = String(
      req.query.userId || ""
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const senders = await getSenders(
      userId
    );

    return res.status(200).json({
      success: true,
      senders,
    });
  } catch (error) {
    console.error(
      "Get senders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch senders",
    });
  }
}

/*
 * GET /api/senders/:id?userId=...
 *
 * Get one sender.
 *
 * smtpPass is never returned.
 */
export async function getSenderController(
  req: Request,
  res: Response
) {
  try {
    const senderId = String(
      req.params.id
    );

    const userId = String(
      req.query.userId || ""
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const sender =
      await getSenderById(
        senderId,
        userId
      );

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    return res.status(200).json({
      success: true,
      sender,
    });
  } catch (error) {
    console.error(
      "Get sender error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sender",
    });
  }
}

/*
 * POST /api/senders/test-connection
 *
 * Test SMTP credentials BEFORE saving a sender.
 *
 * Password is never returned.
 */
export async function testSmtpConnectionController(
  req: Request,
  res: Response
) {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
    } = req.body;

    if (
      !smtpHost ||
      !smtpPort ||
      !smtpUser ||
      !smtpPass
    ) {
      return res.status(400).json({
        success: false,
        message:
          "SMTP host, port, username and password are required",
      });
    }

    const result =
      await testSmtpConnection({
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
      });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "SMTP connection test failed:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "SMTP connection failed",
    });
  }
}

/*
 * POST /api/senders/:id/test-connection
 *
 * Test an EXISTING saved sender.
 *
 * SMTP credentials are retrieved internally
 * from PostgreSQL and are never returned.
 */
export async function testExistingSenderConnectionController(
  req: Request,
  res: Response
) {
  try {
    const senderId = String(
      req.params.id
    );

    const userId = String(
      req.body.userId || ""
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const sender =
      await getSenderSmtpCredentials(
        senderId,
        userId
      );

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "Sender not found",
      });
    }

    const result =
      await testSmtpConnection({
        smtpHost: sender.smtpHost,
        smtpPort: sender.smtpPort,
        smtpUser: sender.smtpUser,
        smtpPass: sender.smtpPass,
      });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "Existing sender SMTP connection test failed:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "SMTP connection failed",
    });
  }
}

/*
 * PUT /api/senders/:id
 *
 * Update an existing sender.
 *
 * SMTP password is never returned.
 *
 * If smtpPass is not provided or is empty,
 * the existing password remains unchanged.
 */
export async function updateSenderController(
  req: Request,
  res: Response
) {
  try {
    const senderId = String(
      req.params.id
    );

    const {
      userId,
      name,
      email,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      hourlyLimit,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const updateData: {
      name?: string;
      email?: string;
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPass?: string;
      hourlyLimit?: number;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (smtpHost !== undefined) {
      updateData.smtpHost = smtpHost;
    }

    if (smtpPort !== undefined) {
      updateData.smtpPort =
        Number(smtpPort);
    }

    if (smtpUser !== undefined) {
      updateData.smtpUser = smtpUser;
    }

    if (
      smtpPass !== undefined &&
      String(smtpPass).trim() !== ""
    ) {
      updateData.smtpPass = smtpPass;
    }

    if (hourlyLimit !== undefined) {
      updateData.hourlyLimit =
        Number(hourlyLimit);
    }

    if (
      Object.keys(updateData).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field is required to update",
      });
    }

    const sender =
      await updateSender(
        senderId,
        userId,
        updateData
      );

    return res.status(200).json({
      success: true,
      message: "Sender updated successfully",
      sender,
    });
  } catch (error) {
    console.error(
      "Update sender error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update sender",
    });
  }
}

/*
 * DELETE /api/senders/:id
 *
 * Delete a sender.
 */
export async function deleteSenderController(
  req: Request,
  res: Response
) {
  try {
    const senderId = String(
      req.params.id
    );

    const userId = String(
      req.body.userId || ""
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    await deleteSender(
      senderId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Sender deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete sender error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete sender",
    });
  }
}