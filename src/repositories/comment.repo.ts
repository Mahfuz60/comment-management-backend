import mongoose from "mongoose";
import { CommentModel } from "../models/comment.model";

export type CommentSort = "newest" | "mostLiked" | "mostDisliked";

const sortMap: Record<CommentSort, any> = {
  newest: { createdAt: -1 },
  mostLiked: { likeCount: -1, createdAt: -1 },
  mostDisliked: { dislikeCount: -1, createdAt: -1 },
};

export const CommentRepo = {
  create: async (data: {
    entityType: string;
    entityId: string;
    parentId: string | null;
    authorId: string;
    content: string;
  }) => {
    return CommentModel.create({
      entityType: data.entityType,
      entityId: data.entityId,
      parentId: data.parentId
        ? new mongoose.Types.ObjectId(data.parentId)
        : null,
      authorId: new mongoose.Types.ObjectId(data.authorId),
      content: data.content,
    });
  },

  findById: async (id: string) => {
    return CommentModel.findById(id).exec();
  },

  updateContent: async (id: string, content: string) => {
    return CommentModel.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    ).exec();
  },

  deleteManyByIds: async (
    ids: mongoose.Types.ObjectId[],
    session?: mongoose.ClientSession
  ) => {
    return CommentModel.deleteMany({ _id: { $in: ids } })
      .session(session ?? null)
      .exec();
  },

  list: async (args: {
    entityType: string;
    entityId: string;
    parentId: string | null;
    sort: CommentSort;
    skip: number;
    limit: number;
  }) => {
    const filter: any = {
      entityType: args.entityType,
      entityId: args.entityId,
      parentId: args.parentId
        ? new mongoose.Types.ObjectId(args.parentId)
        : null,
    };

    const [totalCount, rows] = await Promise.all([
      CommentModel.countDocuments(filter).exec(),
      CommentModel.find(filter)
        .sort(sortMap[args.sort])
        .skip(args.skip)
        .limit(args.limit)
        .populate({ path: "authorId", select: "_id name" })
        .lean()
        .exec(),
    ]);

    return { totalCount, rows };
  },

  findDescendantsForRoots: async (rootIds: mongoose.Types.ObjectId[]) => {
    const allIds: mongoose.Types.ObjectId[] = [];
    let frontier = [...rootIds];

    while (frontier.length) {
      const children = await CommentModel.find(
        { parentId: { $in: frontier } },
        null
      )
        .populate({ path: "authorId", select: "_id name" })
        .lean()
        .exec();

      const childIds = children.map(
        (c: any) => c._id as mongoose.Types.ObjectId
      );
      allIds.push(...childIds);

      frontier = childIds;
    }

    if (allIds.length === 0) return [];

    return CommentModel.find({ _id: { $in: allIds } })
      .populate({ path: "authorId", select: "_id name" })
      .lean()
      .exec();
  },

  collectThreadIds: async (rootId: mongoose.Types.ObjectId) => {
    const ids: mongoose.Types.ObjectId[] = [rootId];
    let frontier: mongoose.Types.ObjectId[] = [rootId];

    while (frontier.length) {
      const children = await CommentModel.find(
        { parentId: { $in: frontier } },
        { _id: 1 }
      )
        .lean()
        .exec();

      const childIds = children.map(
        (c: any) => c._id as mongoose.Types.ObjectId
      );
      ids.push(...childIds);
      frontier = childIds;
    }

    return ids;
  },

  findAllIdsByEntity: async (
    entityType: string,
    entityId: string
  ): Promise<mongoose.Types.ObjectId[]> => {
    const rows = await CommentModel.find({ entityType, entityId }, { _id: 1 })
      .lean()
      .exec();
    return rows.map((r) => r._id as mongoose.Types.ObjectId);
  },
};
