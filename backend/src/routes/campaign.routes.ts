import { Router } from "express";

import {
  createCampaignController,
  getCampaignsController,
  getCampaignController,
  startCampaignController,
  cancelCampaignController,
} from "../controllers/campaign.controller.js";

const router = Router();

router.post(
  "/",
  createCampaignController
);

router.get(
  "/",
  getCampaignsController
);

router.get(
  "/:id",
  getCampaignController
);

router.post(
  "/:id/start",
  startCampaignController
);

router.post(
  "/:id/cancel",
  cancelCampaignController
);

export default router;