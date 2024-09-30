import {
  FieldFilterOperatorEnum,
  Filter,
  IntrospectionField,
  LogicalFilter,
  TypeKind,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { buildFilterCondition, buildGraphQlQuery } from './queryBuilder';

describe('buildGraphQlQuery', () => {
  const queryBody = 'id status';
  const type = 'ProcessInstances';
  const offset = 0;
  const limit = 10;
  const order = 'asc';
  const sortField = 'name';
  const pagination: Pagination = {
    offset,
    limit,
    order,
    sortField,
  };

  const paginationString = `orderBy: {${sortField}: ${order.toUpperCase()}}, pagination: {limit: ${limit}, offset: ${offset}})`;
  const whereClause = 'version: "1.0"';

  it('should build a basic query without where clause and pagination', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
    });
    expect(result).toBe(`{${type} {${queryBody} } }`);
  });

  it('should build a query with a where clause', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
      whereClause,
    });
    expect(result).toBe(`{${type} (where: {${whereClause}}) {${queryBody} } }`);
  });

  it('should build a query with pagination', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
      pagination,
    });
    expect(result).toBe(`{${type} (${paginationString} {${queryBody} } }`);
  });

  it('should build a query with both where clause and pagination', () => {
    const result = buildGraphQlQuery({
      type,
      queryBody,
      whereClause,
      pagination,
    });
    expect(result).toBe(
      `{${type} (where: {${whereClause}}, ${paginationString} {${queryBody} } }`,
    );
  });
});
describe('column filters', () => {
  it('returns empty string when filters are null or undefined', () => {
    expect(buildFilterCondition([])).toBe('');
  });

  it('one string field', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];
    const filedFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.Eq,
      value: 'Hello World Workflow',
    };
    const logicalFilter: Filter = filedFilter;

    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe('name: {equal: "Hello World Workflow"}');
  });

  it('two string field with or', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
      {
        name: 'id',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];

    const helloWorldFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.Eq,
      value: 'Hello World Workflow',
    };
    const greetingFilter = {
      field: 'id',
      operator: FieldFilterOperatorEnum.Eq,
      value: 'yamlgreet',
    };

    const logicalFilter: LogicalFilter = {
      operator: 'OR',
      filters: [helloWorldFilter, greetingFilter],
    };
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe(
      'or: {name: {equal: "Hello World Workflow"}, id: {equal: "yamlgreet"}}',
    );
  });

  it('multiple string field with or', () => {
    // Given
    const introspectionFields: IntrospectionField[] =
      createIntrospectionFields(5);
    const stringFilters = createStringFilter(5);

    const logicalFilter: LogicalFilter = {
      operator: 'OR',
      filters: stringFilters,
    };
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe(
      'or: {name_0: {equal: "value_0"}, name_1: {equal: "value_1"}, name_2: {equal: "value_2"}, name_3: {equal: "value_3"}, name_4: {equal: "value_4"}}',
    );
  });

  it('two string field with and', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
      {
        name: 'id',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];

    const helloWorldFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.Eq,
      value: 'Hello World Workflow',
    };
    const greetingFilter = {
      field: 'id',
      operator: FieldFilterOperatorEnum.Eq,
      value: 'yamlgreet',
    };

    const logicalFilter: LogicalFilter = {
      operator: 'AND',
      filters: [helloWorldFilter, greetingFilter],
    };
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe(
      'and: {name: {equal: "Hello World Workflow"}, id: {equal: "yamlgreet"}}',
    );
  });

  it('in operator with strings', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];
    const filedFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.In,
      value: ['Hello World Workflow', 'Greeting Workflow'],
    };
    const logicalFilter: Filter = filedFilter;
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe(
      'name: {in: ["Hello World Workflow", "Greeting Workflow"]}',
    );
  });

  it('isNull operator true string', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];
    const filedFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.IsNull,
      value: 'true',
    };
    const logicalFilter: Filter = filedFilter;
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe('name: {isNull: true}');
  });

  it('isNull operator true number', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];
    const filedFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.IsNull,
      value: 1,
    };
    const logicalFilter: Filter = filedFilter;
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe('name: {isNull: true}');
  });
  it('isNull operator false string', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];
    const filedFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.IsNull,
      value: 'false',
    };
    const logicalFilter: Filter = filedFilter;
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe('name: {isNull: false}');
  });

  it('isNull operator false number', () => {
    // Given
    const introspectionFields: IntrospectionField[] = [
      {
        name: 'name',
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      },
    ];
    const filedFilter = {
      field: 'name',
      operator: FieldFilterOperatorEnum.IsNull,
      value: 0,
    };
    const logicalFilter: Filter = filedFilter;
    // When
    const result = buildFilterCondition(introspectionFields, logicalFilter);

    // Then
    expect(result).toBe('name: {isNull: false}');
  });

  function createStringFilter(howmany: number): Filter[] {
    const filters: Filter[] = [];
    for (let i = 0; i < howmany; i++) {
      filters.push({
        field: `name_${i}`,
        operator: FieldFilterOperatorEnum.Eq,
        value: `value_${i}`,
      });
    }
    return filters;
  }
  function createIntrospectionFields(howmany: number): IntrospectionField[] {
    const introspectionFields: IntrospectionField[] = [];
    for (let i = 0; i < howmany; i++) {
      introspectionFields.push({
        name: `name_${i}`,
        type: {
          name: TypeName.String,
          kind: TypeKind.InputObject,
          ofType: null,
        },
      });
    }
    return introspectionFields;
  }
});
