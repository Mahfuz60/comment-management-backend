import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongoUri);
  logger.info({ msg: "MongoDB connected" });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });
};
