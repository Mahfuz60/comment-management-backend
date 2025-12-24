import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const EntityTypes = ["post", "video", "article"] as const;
export type EntityType = (typeof EntityTypes)[number];

const CommentSchema = new Schema(
  {
    entityType: { type: String, enum: EntityTypes, required: true },
    entityId: { type: String, required: true, trim: true, maxlength: 200 },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

CommentSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
CommentSchema.index({ entityType: 1, entityId: 1, likeCount: -1 });
CommentSchema.index({ entityType: 1, entityId: 1, dislikeCount: -1 });
CommentSchema.index({ parentId: 1, createdAt: -1 });

export type CommentDoc = InferSchemaType<typeof CommentSchema> & { _id: mongoose.Types.ObjectId };

export const CommentModel = mongoose.model("Comment", CommentSchema);
