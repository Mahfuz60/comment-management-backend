import type { CorsOptions } from "cors";
import { env } from "./env";

export const corsOptions: CorsOptions = {
  origin: env.cors.origin.includes(",")
    ? env.cors.origin.split(",")
    : env.cors.origin,
  credentials: env.cors.credentials,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
