import type { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import type { SocketUser } from "../types/socket";

const getToken = (socket: Socket): string | null => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.length) return authToken;

  const h = socket.handshake.headers["authorization"];
  if (typeof h === "string") {
    const [type, token] = h.split(" ");
    if (type?.toLowerCase() === "bearer" && token) return token;
  }
  return null;
};

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = getToken(socket);
    if (!token) return next(new Error("Unauthorized"));

    const payload = verifyAccessToken(token);
    const user: SocketUser = { _id: payload.sub, email: payload.email, name: payload.name };
    (socket.data as any).user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};
