import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),

  mongoUri: requireEnv("MONGO_URI"),

  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  authMode: (process.env.AUTH_MODE ?? "bearer") as "bearer" | "cookie",

  cookie: {
    name: process.env.COOKIE_NAME ?? "access_token",
    secure: (process.env.COOKIE_SECURE ?? "false") === "true",
    sameSite: (process.env.COOKIE_SAMESITE ?? "lax") as "lax" | "strict" | "none",
    domain: process.env.COOKIE_DOMAIN || undefined
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: (process.env.CORS_CREDENTIALS ?? "true") === "true"
  },

  authRateLimit: {
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 20)
  },

  logLevel: process.env.LOG_LEVEL ?? "info"
} as const;
