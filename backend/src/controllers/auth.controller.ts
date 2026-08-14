import { Request, Response } from "express";

import { authenticateWithGoogle } from "../services/auth.service.js";

export async function googleAuthController(
  req: Request,
  res: Response
) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    const user =
      await authenticateWithGoogle(
        credential
      );

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      user,
    });
  } catch (error) {
    console.error(
      "Google authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Google authentication failed",
    });
  }
}