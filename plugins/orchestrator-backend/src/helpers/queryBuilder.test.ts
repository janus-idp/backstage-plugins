import { Pagination } from '../types/pagination';
import { buildGraphQlQuery } from './queryBuilder';

describe('buildGraphQlQuery', () => {
  const defaultTestParams = {
    queryBody: 'id status',
    type: 'ProcessInstances' as
      | 'ProcessDefinitions'
      | 'ProcessInstances'
      | 'Jobs',
    pagination: {
      offset: 0,
      limit: 10,
      order: 'asc',
      sortField: 'name',
    } as Pagination | undefined,
    whereClause: 'version: "1.0"',
  };

  const getPaginationString = (pagination: Pagination | undefined) => {
    const paginationOrder = pagination?.order
      ? pagination.order.toUpperCase()
      : 'ASC';
    if (pagination) {
      return `orderBy: {${pagination.sortField}: ${paginationOrder}}, pagination: {limit: ${pagination.limit}, offset: ${pagination.offset}})`;
    }
    return undefined;
  };

  type TestCase = {
    name: string;
    params: typeof defaultTestParams;
    expectedResult: string;
  };

  const testCases: TestCase[] = [
    {
      name: 'should build a basic query without where clause and pagination',
      params: {
        type: defaultTestParams.type,
        queryBody: defaultTestParams.queryBody,
        whereClause: '',
        pagination: {},
      },
      expectedResult: `{${defaultTestParams.type} {${defaultTestParams.queryBody} } }`,
    },
    {
      name: 'should build a query with a where clause',
      params: {
        type: defaultTestParams.type,
        queryBody: defaultTestParams.queryBody,
        whereClause: defaultTestParams.whereClause,
        pagination: {},
      },
      expectedResult: `{${defaultTestParams.type} (where: {${defaultTestParams.whereClause}}) {${defaultTestParams.queryBody} } }`,
    },
    {
      name: 'should build a query with pagination',
      params: {
        type: defaultTestParams.type,
        queryBody: defaultTestParams.queryBody,
        whereClause: '',
        pagination: defaultTestParams.pagination,
      },
      expectedResult: `{${defaultTestParams.type} (${getPaginationString(defaultTestParams.pagination)} {${defaultTestParams.queryBody} } }`,
    },
    {
      name: 'should build a query with both where clause and pagination',
      params: {
        ...defaultTestParams,
      },
      expectedResult: `{${defaultTestParams.type} (where: {${defaultTestParams.whereClause}}, ${getPaginationString(defaultTestParams.pagination)} {${defaultTestParams.queryBody} } }`,
    },
  ];

  testCases.forEach(({ name, params, expectedResult }) => {
    it(`${name}`, () => {
      const result = buildGraphQlQuery(params);
      expect(result).toBe(expectedResult);
    });
  });
});
