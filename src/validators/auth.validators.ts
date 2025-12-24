import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200),
    email: z.string().email().max(320),
    password: z.string().min(6).max(200),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().max(320),
    password: z.string().min(6).max(200),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});
