import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiters";
import { requireAuth } from "../middleware/auth";
import { loginSchema, signupSchema } from "../validators/auth.validators";

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validate(signupSchema),
  AuthController.signup
);

authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  AuthController.login
);
authRouter.get("/me", requireAuth, AuthController.me);

authRouter.post("/logout", requireAuth, AuthController.logout);
