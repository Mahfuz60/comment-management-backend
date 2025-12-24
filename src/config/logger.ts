import pino, { type LoggerOptions } from "pino";
import { env } from "./env";

const isDevelopment = env.nodeEnv === "development";

const sensitiveKeys = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.cookies",
  "res.headers['set-cookie']",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.refreshToken",
];

const transport: LoggerOptions["transport"] = isDevelopment
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
        messageFormat: "{msg}",
      },
    }
  : undefined;

const options: LoggerOptions = {
  level: env.logLevel || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: sensitiveKeys,
    remove: true,
  },
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  transport,
};

export const logger = pino(options);
