import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";
import { initSockets } from "./sockets";

const bootstrap = async () => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);
  initSockets(server);

  server.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, "Server started");
  });

  const gracefulShutdown = () => {
    logger.info("Received kill signal, shutting down gracefully");
    server.close(() => {
      logger.info("Closed out remaining connections");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
};

void bootstrap();
