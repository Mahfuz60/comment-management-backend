import mongoose from "mongoose";
import { CommentReactionModel } from "../models/commentReaction.model";
import type { ReactionValue } from "../models/commentReaction.model";

export const ReactionRepo = {
  findForUserAndComments: (userId: string, commentIds: string[]) =>
    CommentReactionModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      commentId: { $in: commentIds.map((id) => new mongoose.Types.ObjectId(id)) }
    })
      .lean()
      .exec(),

  findOne: (userId: mongoose.Types.ObjectId, commentId: mongoose.Types.ObjectId, session?: mongoose.ClientSession) =>
    CommentReactionModel.findOne({ userId, commentId }).session(session ?? null),

  upsert: (
    userId: mongoose.Types.ObjectId,
    commentId: mongoose.Types.ObjectId,
    value: ReactionValue,
    session: mongoose.ClientSession
  ) =>
    CommentReactionModel.findOneAndUpdate(
      { userId, commentId },
      { $set: { value } },
      { upsert: true, new: true, session }
    ),

  deleteOne: (userId: mongoose.Types.ObjectId, commentId: mongoose.Types.ObjectId, session: mongoose.ClientSession) =>
    CommentReactionModel.deleteOne({ userId, commentId }).session(session),

  deleteManyByCommentIds: (commentIds: mongoose.Types.ObjectId[], session?: mongoose.ClientSession) =>
    CommentReactionModel.deleteMany({ commentId: { $in: commentIds } }).session(session ?? null)
};
