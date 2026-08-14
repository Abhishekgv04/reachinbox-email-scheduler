import { Request, Response } from "express";

import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  startCampaign,
  cancelCampaign,
} from "../services/campaign.service.js";

/*
 * POST /api/campaigns
 *
 * Create a new campaign.
 */
export async function createCampaignController(
  req: Request,
  res: Response
) {
  try {
    const {
      userId,
      senderId,
      subject,
      body,
      startAt,
      delaySeconds,
      hourlyLimit,
      recipients,
    } = req.body;

    // Basic validation
    if (
      !userId ||
      !senderId ||
      !subject ||
      !body ||
      !startAt ||
      !Array.isArray(recipients)
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required campaign fields",
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required",
      });
    }

    const parsedDelaySeconds =
      Number(delaySeconds) || 2;

    const parsedHourlyLimit =
      Number(hourlyLimit) || 200;

    if (parsedDelaySeconds < 0) {
      return res.status(400).json({
        success: false,
        message: "delaySeconds cannot be negative",
      });
    }

    if (parsedHourlyLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "hourlyLimit must be greater than 0",
      });
    }

    const campaign = await createCampaign({
      userId,
      senderId,
      subject,
      body,
      startAt,
      delaySeconds: parsedDelaySeconds,
      hourlyLimit: parsedHourlyLimit,
      recipients,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error(
      "Create campaign error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create campaign",
    });
  }
}

/*
 * GET /api/campaigns?userId=...
 *
 * Get all campaigns belonging to a user.
 */
export async function getCampaignsController(
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

    const campaigns =
      await getCampaigns(userId);

    return res.status(200).json({
      success: true,
      campaigns,
    });
  } catch (error) {
    console.error(
      "Get campaigns error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
}

/*
 * GET /api/campaigns/:id?userId=...
 *
 * Get one campaign.
 */
export async function getCampaignController(
  req: Request,
  res: Response
) {
  try {
    const campaignId = String(
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

    const campaign =
      await getCampaignById(
        campaignId,
        userId
      );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    return res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error(
      "Get campaign error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
    });
  }
}

/*
 * POST /api/campaigns/:id/start
 *
 * Start a DRAFT campaign.
 */
export async function startCampaignController(
  req: Request,
  res: Response
) {
  try {
    const campaignId = String(
      req.params.id
    );

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const campaign =
      await startCampaign(
        campaignId,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Campaign scheduled successfully",
      campaign,
    });
  } catch (error) {
    console.error(
      "Start campaign error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start campaign",
    });
  }
}

/*
 * POST /api/campaigns/:id/cancel
 *
 * Cancel a campaign.
 */
export async function cancelCampaignController(
  req: Request,
  res: Response
) {
  try {
    const campaignId = String(
      req.params.id
    );

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const campaign =
      await cancelCampaign(
        campaignId,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Campaign cancelled successfully",
      campaign,
    });
  } catch (error) {
    console.error(
      "Cancel campaign error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel campaign",
    });
  }
}