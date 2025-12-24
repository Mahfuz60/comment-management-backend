import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { CommentRepo, type CommentSort } from "../repositories/comment.repo";
import { ReactionRepo } from "../repositories/reaction.repo";

export type CommentDTO = {
  _id: string;
  entityType: string;
  entityId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  updatedAt: string;
  author: { _id: string; name: string };
  myReaction?: "like" | "dislike" | null;
  canEdit: boolean;
};

function toDTO(
  row: any,
  myReaction: "like" | "dislike" | null,
  currentUserId: string | null
): CommentDTO {
  const authorId = String(row.authorId?._id ?? row.authorId);
  return {
    _id: String(row._id),
    entityType: row.entityType,
    entityId: row.entityId,
    parentId: row.parentId ? String(row.parentId) : null,
    content: row.content,
    likeCount: row.likeCount ?? 0,
    dislikeCount: row.dislikeCount ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: {
      _id: authorId,
      name: row.authorId?.name ?? "Unknown",
    },
    myReaction,
    canEdit: currentUserId ? currentUserId === authorId : false,
  };
}

export const CommentService = {
  list: async (args: {
    entityType: string;
    entityId: string;
    parentId: string | null;
    sort: CommentSort;
    skip: number;
    limit: number;
    userId: string | null;
    includeReplies?: boolean;
  }) => {
    const {
      entityType,
      entityId,
      parentId,
      sort,
      skip,
      limit,
      userId,
      includeReplies,
    } = args;

    const { totalCount, rows } = await CommentRepo.list({
      entityType,
      entityId,
      parentId,
      sort,
      skip,
      limit,
    });

    const rootIds = rows.map((r) => r._id as mongoose.Types.ObjectId);

    let replyRows: any[] = [];
    if (includeReplies && parentId === null && rootIds.length > 0) {
      replyRows = await CommentRepo.findDescendantsForRoots(rootIds);
    }

    const allRows = [...rows, ...replyRows];

    let myReactionMap = new Map<string, "like" | "dislike">();

    if (userId && allRows.length > 0) {
      const ids = allRows.map((r: any) => String(r._id));
      const reactions = await ReactionRepo.findForUserAndComments(userId, ids);

      myReactionMap = new Map(
        reactions.map((x: any) => [String(x.commentId), x.value])
      );
    }

    const dtos = allRows.map((r) =>
      toDTO(r, myReactionMap.get(String(r._id)) ?? null, userId)
    );

    const rootDtos = dtos.filter((d) => d.parentId === null);
    const includedReplies = dtos.filter((d) => d.parentId !== null);

    return { totalCount, data: rootDtos, includedReplies };
  },

  create: async (data: {
    entityType: string;
    entityId: string;
    parentId: string | null;
    content: string;
    authorId: string;
  }) => {
    if (data.parentId) {
      const parent = await CommentRepo.findById(data.parentId);
      if (!parent) throw new AppError("Parent comment not found", 404);
    }

    const created = await CommentRepo.create({
      entityType: data.entityType,
      entityId: data.entityId,
      parentId: data.parentId,
      content: data.content,
      authorId: data.authorId,
    });

    const populated = await created.populate({
      path: "authorId",
      select: "_id name",
    });
    return toDTO(populated, null, data.authorId);
  },
  update: async (data: { id: string; userId: string; content: string }) => {
    const existing = await CommentRepo.findById(data.id);
    if (!existing) throw new AppError("Comment not found", 404);
    if (String(existing.authorId) !== data.userId)
      throw new AppError("Forbidden", 403);

    const updated = await CommentRepo.updateContent(data.id, data.content);
    if (!updated) throw new AppError("Comment not found", 404);

    const populated = await updated.populate({
      path: "authorId",
      select: "_id name",
    });
    return toDTO(populated, null, data.userId);
  },

  remove: async (data: { id: string; userId: string }) => {
    const existing = await CommentRepo.findById(data.id);
    if (!existing) throw new AppError("Comment not found", 404);
    if (String(existing.authorId) !== data.userId)
      throw new AppError("Forbidden", 403);

    const ids = await CommentRepo.collectThreadIds(existing._id);
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await ReactionRepo.deleteManyByCommentIds(ids, session);
        await CommentRepo.deleteManyByIds(ids, session);
      });
    } finally {
      session.endSession();
    }

    return { deletedIds: ids.map((x) => String(x)) };
  },

  removeAll: async (data: { entityType: string; entityId: string }) => {
    const ids = await CommentRepo.findAllIdsByEntity(
      data.entityType,
      data.entityId
    );
    if (ids.length === 0) return { deletedCount: 0 };

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await ReactionRepo.deleteManyByCommentIds(ids, session);
        await CommentRepo.deleteManyByIds(ids, session);
      });
    } finally {
      session.endSession();
    }

    return { deletedCount: ids.length };
  },
};
