import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const ReactionValues = ["like", "dislike"] as const;
export type ReactionValue = (typeof ReactionValues)[number];

const CommentReactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    commentId: { type: Schema.Types.ObjectId, ref: "Comment", required: true, index: true },
    value: { type: String, enum: ReactionValues, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommentReactionSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export type CommentReactionDoc = InferSchemaType<typeof CommentReactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CommentReactionModel = mongoose.model("CommentReaction", CommentReactionSchema);
