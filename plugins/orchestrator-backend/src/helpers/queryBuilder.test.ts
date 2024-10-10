import {
  FieldFilterOperatorEnum,
  Filter,
  IntrospectionField,
  TypeKind,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { buildFilterCondition, buildGraphQlQuery } from './queryBuilder';

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

describe('column filters', () => {
  const createStringIntrospectionField = (
    name: string,
  ): IntrospectionField => ({
    name,
    type: {
      name: TypeName.String,
      kind: TypeKind.InputObject,
      ofType: null,
    },
  });

  const createIdIntrospectionField = (name: string): IntrospectionField => ({
    name,
    type: {
      name: TypeName.Id,
      kind: TypeKind.InputObject,
      ofType: null,
    },
  });

  const createFieldFilter = (
    field: string,
    operator: FieldFilterOperatorEnum,
    value: any,
  ): Filter => ({
    field,
    operator,
    value,
  });

  type FilterTestCase = {
    name: string;
    introspectionFields: IntrospectionField[];
    filter: Filter | undefined;
    expectedResult: string;
  };
  describe('empty filter testcases', () => {
    const emptyFilterTestCases: FilterTestCase[] = [
      {
        name: 'returns empty string when filters are null or undefined',
        introspectionFields: [],
        filter: undefined,
        expectedResult: '',
      },
    ];
    emptyFilterTestCases.forEach(
      ({ name, introspectionFields, filter, expectedResult }) => {
        it(`${name}`, () => {
          const result = buildFilterCondition(introspectionFields, filter);
          expect(result).toBe(expectedResult);
        });
      },
    );
  });
  describe('stringArgument testcases', () => {
    const stringTestCases: FilterTestCase[] = [
      {
        name: 'returns correct filter for single string field with equal operator',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.Eq,
          'Hello World Workflow',
        ),
        expectedResult: 'name: {equal: "Hello World Workflow"}',
      },
      {
        name: 'returns correct filter for single string field with like operator',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.Like,
          'Hello%',
        ),
        expectedResult: 'name: {like: "Hello%"}',
      },
      {
        name: 'returns correct filter for string field with isNull operator (true)',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter('name', FieldFilterOperatorEnum.IsNull, true),
        expectedResult: 'name: {isNull: true}',
      },
      {
        name: 'returns correct filter for string field with isNull operator (false)',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.IsNull,
          false,
        ),
        expectedResult: 'name: {isNull: false}',
      },
      {
        name: 'returns correct filter for string field with isNull operator ("true" as string)',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.IsNull,
          'True',
        ),
        expectedResult: 'name: {isNull: true}',
      },
      {
        name: 'returns correct filter for string field with isNull operator ("false" as string)',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.IsNull,
          'FALSE',
        ),
        expectedResult: 'name: {isNull: false}',
      },
      {
        name: 'returns correct filter for string field with in operator (single value)',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter('name', FieldFilterOperatorEnum.In, [
          'Test String',
        ]),
        expectedResult: 'name: {in: ["Test String"]}',
      },
      {
        name: 'returns correct filter for string field with in operator (multiple values)',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: createFieldFilter('name', FieldFilterOperatorEnum.In, [
          'Test String 1',
          'Test String 2',
          'Test String 3',
        ]),
        expectedResult:
          'name: {in: ["Test String 1", "Test String 2", "Test String 3"]}',
      },
      {
        name: 'returns correct OR filter for two string fields with equal operator',
        introspectionFields: [
          createStringIntrospectionField('name'),
          createStringIntrospectionField('processName'),
        ],
        filter: {
          operator: 'OR',
          filters: [
            createFieldFilter(
              'name',
              FieldFilterOperatorEnum.Eq,
              'Hello World Workflow',
            ),
            createFieldFilter(
              'processName',
              FieldFilterOperatorEnum.Eq,
              'Greeting workflow',
            ),
          ],
        },
        expectedResult:
          'or: {name: {equal: "Hello World Workflow"}, processName: {equal: "Greeting workflow"}}',
      },
      {
        name: 'returns correct filter for string field with like and isNull operators',
        introspectionFields: [createStringIntrospectionField('description')],
        filter: {
          operator: 'OR',
          filters: [
            createFieldFilter(
              'description',
              FieldFilterOperatorEnum.Like,
              '%Test%',
            ),
            createFieldFilter(
              'description',
              FieldFilterOperatorEnum.IsNull,
              true,
            ),
          ],
        },
        expectedResult:
          'or: {description: {like: "%Test%"}, description: {isNull: true}}',
      },
      {
        name: 'returns correct filter for string field with in, like, equal, and isNull operators',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: {
          operator: 'OR',
          filters: [
            createFieldFilter('name', FieldFilterOperatorEnum.In, [
              'Test String 1',
              'Test String 2',
            ]),
            createFieldFilter('name', FieldFilterOperatorEnum.Like, '%Test%'),
            createFieldFilter(
              'name',
              FieldFilterOperatorEnum.Eq,
              'Exact Match',
            ),
            createFieldFilter('name', FieldFilterOperatorEnum.IsNull, false),
          ],
        },
        expectedResult:
          'or: {name: {in: ["Test String 1", "Test String 2"]}, name: {like: "%Test%"}, name: {equal: "Exact Match"}, name: {isNull: false}}',
      },
      {
        name: 'returns correct filter for string field with in, like, equal, and isNull operators',
        introspectionFields: [createStringIntrospectionField('name')],
        filter: {
          operator: 'AND',
          filters: [
            createFieldFilter('name', FieldFilterOperatorEnum.In, [
              'Test String 1',
              'Test String 2',
            ]),
            createFieldFilter('name', FieldFilterOperatorEnum.Like, '%Test%'),
            createFieldFilter(
              'name',
              FieldFilterOperatorEnum.Eq,
              'Exact Match',
            ),
            createFieldFilter('name', FieldFilterOperatorEnum.IsNull, false),
          ],
        },
        expectedResult:
          'and: {name: {in: ["Test String 1", "Test String 2"]}, name: {like: "%Test%"}, name: {equal: "Exact Match"}, name: {isNull: false}}',
      },
    ];
    stringTestCases.forEach(
      ({ name, introspectionFields, filter, expectedResult }) => {
        it(`${name}`, () => {
          const result = buildFilterCondition(introspectionFields, filter);
          expect(result).toBe(expectedResult);
        });
      },
    );
  });

  describe('idArgument testcases', () => {
    const idTestCases: FilterTestCase[] = [
      {
        name: 'returns correct filter for single id field with equal operator',
        introspectionFields: [createIdIntrospectionField('id')],
        filter: createFieldFilter('id', FieldFilterOperatorEnum.Eq, 'idA'),
        expectedResult: 'id: {equal: "idA"}',
      },
      {
        name: 'returns correct filter for single id field with isNull operator (false as boolean)',
        introspectionFields: [createIdIntrospectionField('id')],
        filter: createFieldFilter('id', FieldFilterOperatorEnum.IsNull, false),
        expectedResult: 'id: {isNull: false}',
      },
      {
        name: 'returns correct filter for single id field with isNull operator (false as string)',
        introspectionFields: [createIdIntrospectionField('id')],
        filter: createFieldFilter(
          'id',
          FieldFilterOperatorEnum.IsNull,
          'false',
        ),
        expectedResult: 'id: {isNull: false}',
      },
      {
        name: 'returns correct filter for single id field with IN operator',
        introspectionFields: [createIdIntrospectionField('id')],
        filter: createFieldFilter('id', FieldFilterOperatorEnum.In, [
          'idA',
          'idB',
          'idC',
        ]),
        expectedResult: 'id: {in: ["idA", "idB", "idC"]}',
      },
      {
        name: 'returns correct OR filter for multiple id fields with equal, isNull, and IN operators',
        introspectionFields: [
          createIdIntrospectionField('processId'),
          createIdIntrospectionField('id'),
        ],
        filter: {
          operator: 'OR',
          filters: [
            createFieldFilter('id', FieldFilterOperatorEnum.Eq, 'idA'),
            createFieldFilter(
              'processId',
              FieldFilterOperatorEnum.IsNull,
              'True',
            ),
            createFieldFilter('id', 'IN', ['idA', 'idB', 'idC']),
          ],
        },
        expectedResult:
          'or: {id: {equal: "idA"}, processId: {isNull: true}, id: {in: ["idA", "idB", "idC"]}}',
      },
      {
        name: 'returns correct AND filter for multiple id fields with equal, isNull, and IN operators',
        introspectionFields: [
          createIdIntrospectionField('processId'),
          createIdIntrospectionField('id'),
        ],
        filter: {
          operator: 'AND',
          filters: [
            createFieldFilter('id', FieldFilterOperatorEnum.Eq, 'idA'),
            createFieldFilter(
              'processId',
              FieldFilterOperatorEnum.IsNull,
              'True',
            ),
            createFieldFilter('id', 'IN', ['idA', 'idB', 'idC']),
          ],
        },
        expectedResult:
          'and: {id: {equal: "idA"}, processId: {isNull: true}, id: {in: ["idA", "idB", "idC"]}}',
      },
    ];

    idTestCases.forEach(
      ({ name, introspectionFields, filter, expectedResult }) => {
        it(`${name}`, () => {
          const result = buildFilterCondition(introspectionFields, filter);
          expect(result).toBe(expectedResult);
        });
      },
    );
  });
});
