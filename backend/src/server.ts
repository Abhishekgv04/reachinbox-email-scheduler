import "dotenv/config";
import express from "express";
import cors from "cors";

import { checkDatabaseConnection } from "./services/database.service.js";

import campaignRoutes from "./routes/campaign.routes.js";
import senderRoutes from "./routes/sender.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

/*
 * Middleware
 */
app.use(cors());
app.use(express.json());

/*
 * API Routes
 */
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/campaigns",
  campaignRoutes
);

app.use(
  "/api/senders",
  senderRoutes
);

/*
 * Health Check
 */
app.get("/health", async (_req, res) => {
  try {
    await checkDatabaseConnection();

    return res.status(200).json({
      success: true,
      message: "ReachInbox backend is running",
      database: "connected",
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "Backend is running but database is unavailable",
      database: "disconnected",
    });
  }
});

/*
 * 404 Handler
 */
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
 * Global Error Handler
 */
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      "Unhandled server error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

/*
 * Start Server
 */
app.listen(PORT, () => {
  console.log(
    `Backend server running on http://localhost:${PORT}`
  );
});