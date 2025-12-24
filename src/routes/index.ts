import { Router } from "express";
import { authRouter } from "./auth.routes";
import { commentRouter } from "./comment.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/comments", commentRouter);
