import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { corsOptions } from "../config/cors";
import { logger } from "../config/logger";
import { socketAuth } from "./socketAuth";

export const ioRef: { io?: Server } = {};

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      credentials: corsOptions.credentials
    }
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    const user = (socket.data as any).user;
    logger.info({ userId: user?._id }, "Socket connected");

    socket.on("join", (payload: { entityType: string; entityId: string }) => {
      const room = `${payload.entityType}:${payload.entityId}`;
      void socket.join(room);
    });

    socket.on("leave", (payload: { entityType: string; entityId: string }) => {
      const room = `${payload.entityType}:${payload.entityId}`;
      void socket.leave(room);
    });

    socket.on("disconnect", () => {
      logger.info({ userId: user?._id }, "Socket disconnected");
    });
  });

  ioRef.io = io;
  return io;
};
