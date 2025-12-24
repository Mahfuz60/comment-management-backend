import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayloadUser = {
  sub: string;
  email: string;
  name: string;
};

export const signAccessToken = (user: {
  _id: string;
  email: string;
  name: string;
}) => {
  const payload: JwtPayloadUser = {
    sub: user._id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, env.jwtSecret as string, {
    expiresIn: env.jwtExpiresIn as any,
  });
};

export const verifyAccessToken = (token: string): JwtPayloadUser => {
  return jwt.verify(token, env.jwtSecret) as JwtPayloadUser;
};
