import { Pagination } from '../types/pagination';

export class QueryBuilder {
  public static buildGraphQlQuery(
    type: string,
    queryBody: string,
    whereClause?: string,
    pagination?: Pagination,
  ): string {
    let query = `{${type}`;

    if (whereClause || pagination) {
      query += ` (`;

      if (whereClause) {
        query += `where: {${whereClause}}`;
        if (pagination) {
          query += `, `;
        }
      }
      if (pagination) {
        if (pagination.sortField) {
          query += `orderBy: {${
            pagination.sortField
          }: ${pagination.order?.toUpperCase()}}, `;
        }
        query += `pagination: {limit: ${pagination.limit} , offset: ${pagination.offset}}`;
      }

      query += `) `;
    }
    query += ` {`;
    query += queryBody;
    query += ` }`;
    query += ` }`;

    return query;
  }
}
