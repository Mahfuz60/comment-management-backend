export const parsePagination = (q: any) => {
  const page = Math.max(1, Number(q.page ?? 1));
  const limitRaw = Number(q.limit ?? 20);
  const limit = Math.min(100, Math.max(1, limitRaw));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

type MetaArgs =
  | { page: number; limit: number; totalCount: number }
  | [number, number, number];

export const toPaginationMeta = (
  ...args: MetaArgs extends any ? any[] : never
) => {
  const parsed =
    typeof args[0] === "object"
      ? (args[0] as { page: number; limit: number; totalCount: number })
      : ({ page: args[0], limit: args[1], totalCount: args[2] } as {
          page: number;
          limit: number;
          totalCount: number;
        });

  const totalPages = Math.ceil(parsed.totalCount / parsed.limit) || 1;

  return {
    page: parsed.page,
    limit: parsed.limit,
    totalPages,
    totalCount: parsed.totalCount,
  };
};
