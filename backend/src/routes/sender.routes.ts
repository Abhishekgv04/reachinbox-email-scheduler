import { Router } from "express";

import {
  createSenderController,
  getSendersController,
  getSenderController,
  updateSenderController,
  deleteSenderController,
  testSmtpConnectionController,
  testExistingSenderConnectionController,
} from "../controllers/sender.controller.js";

const router = Router();

router.post(
  "/",
  createSenderController
);

router.get(
  "/",
  getSendersController
);

router.post(
  "/test-connection",
  testSmtpConnectionController
);

router.post(
  "/:id/test-connection",
  testExistingSenderConnectionController
);

router.get(
  "/:id",
  getSenderController
);

router.put(
  "/:id",
  updateSenderController
);

router.delete(
  "/:id",
  deleteSenderController
);

export default router;