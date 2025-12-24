import type { Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

export const mongoSanitizer = mongoSanitize();

const sanitizeValue = (val: unknown): unknown => {
  if (typeof val === "string") return xss(val);
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) out[k] = sanitizeValue(v);
    return out;
  }
  return val;
};

export const xssSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as any;
  req.params = sanitizeValue(req.params) as any;
  next();
};
