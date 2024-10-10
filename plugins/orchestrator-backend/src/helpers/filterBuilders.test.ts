import {
  FieldFilterOperatorEnum,
  Filter,
  IntrospectionField,
  TypeKind,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { buildFilterCondition } from './filterBuilder';

describe('column filters', () => {
  const createIntrospectionField = (
    name: string,
    type: TypeName,
  ): IntrospectionField => ({
    name,
    type: {
      name: type,
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
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.Eq,
          'Hello World Workflow',
        ),
        expectedResult: 'name: {equal: "Hello World Workflow"}',
      },
      {
        name: 'returns correct filter for single string field with like operator',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.Like,
          'Hello%',
        ),
        expectedResult: 'name: {like: "Hello%"}',
      },
      {
        name: 'returns correct filter for string field with isNull operator (true)',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter('name', FieldFilterOperatorEnum.IsNull, true),
        expectedResult: 'name: {isNull: true}',
      },
      {
        name: 'returns correct filter for string field with isNull operator (false)',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.IsNull,
          false,
        ),
        expectedResult: 'name: {isNull: false}',
      },
      {
        name: 'returns correct filter for string field with isNull operator ("true" as string)',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.IsNull,
          'True',
        ),
        expectedResult: 'name: {isNull: true}',
      },
      {
        name: 'returns correct filter for string field with isNull operator ("false" as string)',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter(
          'name',
          FieldFilterOperatorEnum.IsNull,
          'FALSE',
        ),
        expectedResult: 'name: {isNull: false}',
      },
      {
        name: 'returns correct filter for string field with in operator (single value)',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
        filter: createFieldFilter('name', FieldFilterOperatorEnum.In, [
          'Test String',
        ]),
        expectedResult: 'name: {in: ["Test String"]}',
      },
      {
        name: 'returns correct filter for string field with in operator (multiple values)',
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
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
          createIntrospectionField('name', TypeName.String),
          createIntrospectionField('processName', TypeName.String),
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
        introspectionFields: [
          createIntrospectionField('description', TypeName.String),
        ],
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
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
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
        introspectionFields: [
          createIntrospectionField('name', TypeName.String),
        ],
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
        introspectionFields: [createIntrospectionField('id', TypeName.Id)],
        filter: createFieldFilter('id', FieldFilterOperatorEnum.Eq, 'idA'),
        expectedResult: 'id: {equal: "idA"}',
      },
      {
        name: 'returns correct filter for single id field with isNull operator (false as boolean)',
        introspectionFields: [createIntrospectionField('id', TypeName.Id)],
        filter: createFieldFilter('id', FieldFilterOperatorEnum.IsNull, false),
        expectedResult: 'id: {isNull: false}',
      },
      {
        name: 'returns correct filter for single id field with isNull operator (false as string)',
        introspectionFields: [createIntrospectionField('id', TypeName.Id)],
        filter: createFieldFilter(
          'id',
          FieldFilterOperatorEnum.IsNull,
          'false',
        ),
        expectedResult: 'id: {isNull: false}',
      },
      {
        name: 'returns correct filter for single id field with IN operator',
        introspectionFields: [createIntrospectionField('id', TypeName.Id)],
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
          createIntrospectionField('processId', TypeName.Id),
          createIntrospectionField('id', TypeName.Id),
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
          createIntrospectionField('processId', TypeName.Id),
          createIntrospectionField('id', TypeName.Id),
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
  describe('dateArgument testcases', () => {
    const testDate1 = '2024-10-10T09:54:40.759Z';
    const testDate2 = '2025-10-10T09:54:40.759Z';

    const idTestCases: FilterTestCase[] = [
      {
        name: 'returns correct filter for single date field with equal operator',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.Eq,
          testDate1,
        ),
        expectedResult: `start: {equal: "${testDate1}"}`,
      },
      {
        name: 'returns correct filter for single date field with isNull operator (false as boolean)',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.IsNull,
          false,
        ),
        expectedResult: 'start: {isNull: false}',
      },
      {
        name: 'returns correct filter for single date field with isNull operator (false as string)',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.IsNull,
          'false',
        ),
        expectedResult: 'start: {isNull: false}',
      },
      {
        name: 'returns correct filter for single date field with GT operator',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.Gt,
          testDate1,
        ),
        expectedResult: `start: {greaterThan: "${testDate1}"}`,
      },
      {
        name: 'returns correct filter for single date field with GTE operator',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.Gte,
          testDate1,
        ),
        expectedResult: `start: {greaterThanEqual: "${testDate1}"}`,
      },
      {
        name: 'returns correct filter for single date field with LT operator',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.Lt,
          testDate1,
        ),
        expectedResult: `start: {lessThan: "${testDate1}"}`,
      },
      {
        name: 'returns correct filter for single date field with LTE operator',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter(
          'start',
          FieldFilterOperatorEnum.Lte,
          testDate1,
        ),
        expectedResult: `start: {lessThanEqual: "${testDate1}"}`,
      },
      {
        name: 'returns correct filter for single date field with BETWEEN operator',
        introspectionFields: [createIntrospectionField('start', TypeName.Date)],
        filter: createFieldFilter('start', FieldFilterOperatorEnum.Between, [
          testDate1,
          testDate2,
        ]),
        expectedResult: `start: {between: {from: "${testDate1}", to: "${testDate2}"}}`,
      },
      {
        name: 'returns correct OR filter for multiple id fields with equal, isNull, and GT operators',
        introspectionFields: [
          createIntrospectionField('start', TypeName.Date),
          createIntrospectionField('end', TypeName.Date),
        ],
        filter: {
          operator: 'OR',
          filters: [
            createFieldFilter('start', FieldFilterOperatorEnum.Eq, testDate1),
            createFieldFilter('end', FieldFilterOperatorEnum.IsNull, 'False'),
            createFieldFilter('end', FieldFilterOperatorEnum.Gt, testDate1),
          ],
        },
        expectedResult: `or: {start: {equal: "${testDate1}"}, end: {isNull: false}, end: {greaterThan: "${testDate1}"}}`,
      },
      {
        name: 'returns correct OR filter for multiple id fields with equal, isNull, and GTE operators',
        introspectionFields: [
          createIntrospectionField('start', TypeName.Date),
          createIntrospectionField('end', TypeName.Date),
        ],
        filter: {
          operator: 'OR',
          filters: [
            createFieldFilter('start', FieldFilterOperatorEnum.Eq, testDate1),
            createFieldFilter('end', FieldFilterOperatorEnum.IsNull, 'False'),
            createFieldFilter('end', FieldFilterOperatorEnum.Gte, testDate1),
          ],
        },
        expectedResult: `or: {start: {equal: "${testDate1}"}, end: {isNull: false}, end: {greaterThanEqual: "${testDate1}"}}`,
      },
      {
        name: 'returns correct AND filter for multiple id fields with equal, isNull, and LTE operators',
        introspectionFields: [
          createIntrospectionField('start', TypeName.Date),
          createIntrospectionField('end', TypeName.Date),
        ],
        filter: {
          operator: 'AND',
          filters: [
            createFieldFilter('start', FieldFilterOperatorEnum.Eq, testDate1),
            createFieldFilter('end', FieldFilterOperatorEnum.IsNull, 'False'),
            createFieldFilter('end', FieldFilterOperatorEnum.Lte, testDate1),
          ],
        },
        expectedResult: `and: {start: {equal: "${testDate1}"}, end: {isNull: false}, end: {lessThanEqual: "${testDate1}"}}`,
      },
      {
        name: 'returns correct AND filter for multiple id fields with equal, isNull, LTE, and between operators',
        introspectionFields: [
          createIntrospectionField('start', TypeName.Date),
          createIntrospectionField('end', TypeName.Date),
        ],
        filter: {
          operator: 'AND',
          filters: [
            createFieldFilter('start', FieldFilterOperatorEnum.Eq, testDate1),
            createFieldFilter('end', FieldFilterOperatorEnum.IsNull, 'False'),
            createFieldFilter('end', FieldFilterOperatorEnum.Lte, testDate1),
            createFieldFilter('start', FieldFilterOperatorEnum.Between, [
              testDate1,
              testDate2,
            ]),
          ],
        },
        expectedResult: `and: {start: {equal: "${testDate1}"}, end: {isNull: false}, end: {lessThanEqual: "${testDate1}"}, start: {between: {from: "${testDate1}", to: "${testDate2}"}}}`,
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
