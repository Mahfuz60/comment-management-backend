import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";

import { corsOptions } from "./config/cors";
import { logger } from "./config/logger";
import { apiRouter } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { mongoSanitizer, xssSanitizer } from "./middleware/sanitize";

export const createApp = () => {
  const app = express();

  app.use(pinoHttp({ logger }));

  app.use(helmet());
  app.use(cors(corsOptions));

  app.use(express.json({ limit: "200kb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

  app.use(mongoSanitizer);
  app.use(xssSanitizer);

  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
