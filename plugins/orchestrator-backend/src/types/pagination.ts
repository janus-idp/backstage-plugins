import { Request } from 'express-serve-static-core';

export interface Pagination {
  offset?: number;
  limit?: number;
  order?: string;
  sortField?: string;
}

export function buildPagination(req: Request): Pagination {
  const pagination: Pagination = {};

  if (!isNaN(Number(req.query.page))) {
    pagination.offset = Number(req.query.page);
  }

  if (!isNaN(Number(req.query.pageSize))) {
    pagination.limit = Number(req.query.pageSize);
  }

  if (req.query.orderBy) {
    pagination.sortField = String(req.query.orderBy);
  }

  if (req.query.orderDirection) {
    pagination.order = String(req.query.orderDirection);
  }

  return pagination;
}
