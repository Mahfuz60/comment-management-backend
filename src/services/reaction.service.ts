import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { ReactionRepo } from "../repositories/reaction.repo";
import { CommentModel } from "../models/comment.model";
import type { ReactionValue } from "../models/commentReaction.model";

export type ReactionAction = "like" | "dislike" | "clear";

type ReactionResult = {
  _id: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
};

const incField = (v: ReactionValue) => (v === "like" ? { likeCount: 1 } : { dislikeCount: 1 });
const decField = (v: ReactionValue) => (v === "like" ? { likeCount: -1 } : { dislikeCount: -1 });

export const ReactionService = {
  react: async (params: { commentId: string; userId: string; action: ReactionAction }): Promise<ReactionResult> => {
    const commentObjId = new mongoose.Types.ObjectId(params.commentId);
    const userObjId = new mongoose.Types.ObjectId(params.userId);

    const session = await mongoose.startSession();
    try {
      let result: ReactionResult | null = null;

      await session.withTransaction(async () => {
        const comment = await CommentModel.findById(commentObjId).session(session);
        if (!comment) throw new AppError("Comment not found", 404);

        const existing = await ReactionRepo.findOne(userObjId, commentObjId, session);

        const applyClear = async (prev: ReactionValue) => {
          await ReactionRepo.deleteOne(userObjId, commentObjId, session);
          await CommentModel.updateOne({ _id: commentObjId }, { $inc: decField(prev) }).session(session);
          const fresh = await CommentModel.findById(commentObjId).session(session);
          if (!fresh) throw new AppError("Comment not found", 404);
          result = { _id: String(fresh._id), likeCount: fresh.likeCount, dislikeCount: fresh.dislikeCount, myReaction: null };
        };

        if (params.action === "clear") {
          if (existing) {
            await applyClear(existing.value as ReactionValue);
          } else {
            result = {
              _id: String(comment._id),
              likeCount: comment.likeCount,
              dislikeCount: comment.dislikeCount,
              myReaction: null
            };
          }
          return;
        }

        const next = params.action as ReactionValue;

        if (!existing) {
          await ReactionRepo.upsert(userObjId, commentObjId, next, session);
          await CommentModel.updateOne({ _id: commentObjId }, { $inc: incField(next) }).session(session);

          const fresh = await CommentModel.findById(commentObjId).session(session);
          if (!fresh) throw new AppError("Comment not found", 404);
          result = { _id: String(fresh._id), likeCount: fresh.likeCount, dislikeCount: fresh.dislikeCount, myReaction: next };
          return;
        }

        const prev = existing.value as ReactionValue;

        if (prev === next) {
          await applyClear(prev);
          return;
        }

        await ReactionRepo.upsert(userObjId, commentObjId, next, session);
        await CommentModel.updateOne(
          { _id: commentObjId },
          { $inc: { ...decField(prev), ...incField(next) } }
        ).session(session);

        const fresh = await CommentModel.findById(commentObjId).session(session);
        if (!fresh) throw new AppError("Comment not found", 404);
        result = { _id: String(fresh._id), likeCount: fresh.likeCount, dislikeCount: fresh.dislikeCount, myReaction: next };
      });

      if (!result) throw new AppError("Reaction failed", 500);
      return result;
    } finally {
      session.endSession();
    }
  }
};
