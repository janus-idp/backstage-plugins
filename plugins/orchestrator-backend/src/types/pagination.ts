import { Request } from 'express-serve-static-core';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
} from '../service/constants';

export interface Pagination {
  offset?: number;
  limit?: number;
  order?: string;
  sortField?: string;
}

export function buildPagination(req: Request): Pagination {
  return {
    offset: req.query.pageNumber
      ? Number(req.query.pageNumber)
      : DEFAULT_PAGE_NUMBER,
    limit: req.query.pageSize ? Number(req.query.pageSize) : DEFAULT_PAGE_SIZE,
    sortField: req.query.sortField
      ? String(req.query.sortField)
      : DEFAULT_SORT_FIELD,
    order: req.query.order ? String(req.query.order) : DEFAULT_SORT_ORDER,
  };
}
