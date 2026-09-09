import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./utils/config";
import { errorHandler } from "./middleware/errorHandler";
import { NotFoundError } from "./utils/errors";

// Route imports
import authRoutes from "./routes/authRoutes";
import researchRoutes from "./routes/researchRoutes";
import contentRoutes from "./routes/contentRoutes";
import visualRoutes from "./routes/visualRoutes";
import xcrRoutes from "./routes/xcrRoutes";
import activityRoutes from "./routes/activityRoutes";
import adminRoutes from "./routes/adminRoutes";

export function createApp() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [config.frontendUrl, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (config.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "xplover-api",
      version: "1.0.0",
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/research", researchRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/visual", visualRoutes);
  app.use("/api/xcr", xcrRoutes);
  app.use("/api/activity", activityRoutes);
  app.use("/api/admin", adminRoutes);

  // Catch-all 404 handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
