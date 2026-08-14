import { Router } from "express";

import {
  googleAuthController,
} from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/google",
  googleAuthController
);

export default router;