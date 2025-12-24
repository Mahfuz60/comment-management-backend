import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination, toPaginationMeta } from "../utils/pagination";
import { CommentService } from "../services/comment.service";
import { ReactionService } from "../services/reaction.service";
import { ioRef } from "../sockets";

export const CommentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query);

    const sort = (req.query.sort as any) ?? "newest";
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId as string;

    // parentId can be null (roots) or a string
    const parentIdParam = req.query.parentId as string | undefined;
    const parentId = parentIdParam ? parentIdParam : null;

    const includeReplies =
      (req.query.includeReplies as any) === true ||
      req.query.includeReplies === "true";

    const result = await CommentService.list({
      entityType,
      entityId,
      parentId,
      sort,
      skip,
      limit,
      userId: req.user?._id ? String(req.user._id) : null,
      includeReplies,
    });

    return res.status(200).json({
      success: true,
      meta: toPaginationMeta({ page, limit, totalCount: result.totalCount }),

      data: result.data,
      includedReplies: result.includedReplies ?? [],
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await CommentService.create({
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      parentId: req.body.parentId ?? null,
      content: req.body.content,
      authorId: String(req.user!._id),
    });

    ioRef.io?.emit("comment:create", created);
    return res.status(201).json({ success: true, data: created });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await CommentService.update({
      id: req.params.id,
      userId: String(req.user!._id),
      content: req.body.content,
    });

    ioRef.io?.emit("comment:update", updated);
    return res.status(200).json({ success: true, data: updated });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await CommentService.remove({
      id: req.params.id,
      userId: String(req.user!._id),
    });

    ioRef.io?.emit("comment:delete", result);
    return res.status(200).json({ success: true, data: result });
  }),

  react: asyncHandler(async (req: Request, res: Response) => {
    const result = await ReactionService.react({
      commentId: req.params.id,
      userId: req.user!._id,
      action: req.body.action,
    });

    ioRef.io?.emit("comment:reaction", {
      _id: result._id,
      likeCount: result.likeCount,
      dislikeCount: result.dislikeCount,
      myReaction: result.myReaction,
    });

    return res.status(200).json({ success: true, data: result });
  }),
};
