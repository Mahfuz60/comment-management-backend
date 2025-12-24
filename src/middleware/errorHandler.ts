import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { logger } from "../config/logger";
import mongoose from "mongoose";

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let appErr: AppError;

  if (err instanceof AppError) {
    appErr = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    appErr = new AppError("Validation error", 400, err.errors);
  } else if (err instanceof mongoose.Error.CastError) {
    appErr = new AppError("Invalid id format", 400);
  } else if (typeof err === "object" && err && "code" in err && (err as any).code === 11000) {
    appErr = new AppError("Duplicate key error", 409);
  } else {
    appErr = new AppError("Internal server error", 500);
  }

  const status = appErr.statusCode ?? 500;

  if (status >= 500) {
    logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  }

  res.status(status).json({
    success: false,
    message: appErr.message,
    ...(appErr.details ? { details: appErr.details } : {})
  });
};
