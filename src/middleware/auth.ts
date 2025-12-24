import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/appError";
import { verifyAccessToken } from "../utils/jwt";

const extractBearer = (req: Request): string | null => {
  const h = req.headers.authorization;
  if (!h) return null;
  const [type, token] = h.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token =
    env.authMode === "cookie"
      ? (req.cookies?.[env.cookie.name] as string | undefined) ?? null
      : extractBearer(req);

  if (!token) return next(new AppError("Unauthorized", 401));

  try {
    const payload = verifyAccessToken(token);
    req.user = { _id: payload.sub, email: payload.email, name: payload.name };
    return next();
  } catch {
    return next(new AppError("Unauthorized", 401));
  }
};
