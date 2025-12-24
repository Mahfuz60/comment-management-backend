import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listCommentsSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  reactSchema
} from "../validators/comment.validators";

export const commentRouter = Router();

commentRouter.get("/", validate(listCommentsSchema), CommentController.list);
commentRouter.post("/", requireAuth, validate(createCommentSchema), CommentController.create);
commentRouter.patch("/:id", requireAuth, validate(updateCommentSchema), CommentController.update);
commentRouter.delete("/:id", requireAuth, validate(deleteCommentSchema), CommentController.remove);
commentRouter.post("/:id/reactions", requireAuth, validate(reactSchema), CommentController.react);
