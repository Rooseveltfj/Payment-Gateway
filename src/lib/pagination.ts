export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export async function paginate<T>(
  model: unknown,
  queryArgs: unknown = {},
  params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 10));
  const skip = (page - 1) * pageSize;

  const [total, data] = await Promise.all([
    model.count({ where: queryArgs.where }),
    model.findMany({
      ...queryArgs,
      take: pageSize,
      skip: skip,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}

