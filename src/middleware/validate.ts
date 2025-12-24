import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/appError";

export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return next(new AppError("Invalid request", 400, result.error.flatten()));
    }
    req.body = result.data.body;
    req.query = result.data.query as any;
    req.params = result.data.params as any;
    next();
  };
