import { Request } from 'express-serve-static-core';

export interface Pagination {
  offset?: number;
  limit?: number;
  order?: string;
  sortField?: string;
}

export function buildPagination(req: Request): Pagination {
  return {
    offset: req.query.pageNumber ? Number(req.query.pageNumber) : 0,
    limit: req.query.pageSize ? Number(req.query.pageSize) : 10,
    sortField: req.query.sortField ? String(req.query.sortField) : undefined,
    order: req.query.order ? String(req.query.order) : 'ASC',
  };
}
