import { z } from "zod";
import { EntityTypes } from "../models/comment.model";

export const listCommentsSchema = z.object({
  query: z.object({
    entityType: z.enum(EntityTypes),
    entityId: z.string().min(1).max(200),
    parentId: z.string().optional().nullable(),
    includeReplies: z
      .preprocess((v) => v === "true" || v === true, z.boolean())
      .optional()
      .default(false),
    sort: z.enum(["newest", "mostLiked", "mostDisliked"]).default("newest"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  body: z.any().optional(),
  params: z.any().optional(),
});

export const createCommentSchema = z.object({
  body: z.object({
    entityType: z.enum(EntityTypes),
    entityId: z.string().min(1).max(200),
    parentId: z.string().optional().nullable(),
    content: z.string().trim().min(1).max(2000),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    content: z.string().trim().min(1).max(2000),
  }),
  query: z.any().optional(),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.any().optional(),
  query: z.any().optional(),
});

export const reactSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    action: z.enum(["like", "dislike", "clear"]),
  }),
  query: z.any().optional(),
});
