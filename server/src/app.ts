import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { Env } from "./config/env.ts";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";

export type AppConfig = Pick<Env, "NODE_ENV" | "CORS_ORIGINS">;

export function createApp(config: AppConfig, registerRoutes?: (app: Express) => void): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
  app.use(cors({ origin: config.CORS_ORIGINS }));
  if (config.NODE_ENV !== "test") app.use(morgan("common"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/", (_req, res) => {
    res.json({ status: "ok" });
  });

  registerRoutes?.(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
