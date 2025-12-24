import type { Request, Response } from "express";
import { env } from "../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthService } from "../services/auth.service";

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(env.cookie.name, token, {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    domain: env.cookie.domain,
  });
};
export const AuthController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const { user } = await AuthService.signup(name, email, password);

    return res.status(201).json({
      success: true,
      user,
      message: "Signup successful. Please login.",
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);

    if (env.authMode === "cookie") {
      setAuthCookie(res, token);
      return res.status(200).json({ success: true, user });
    }

    return res.status(200).json({ success: true, user, token });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.me(req.user!._id);
    return res.status(200).json({ success: true, user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    if (env.authMode === "cookie") {
      res.clearCookie(env.cookie.name, {
        domain: env.cookie.domain,
        sameSite: env.cookie.sameSite,
        secure: env.cookie.secure,
      });
    }
    return res.status(200).json({ success: true });
  }),
};
