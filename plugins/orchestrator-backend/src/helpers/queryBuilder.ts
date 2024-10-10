import {
  FieldFilterOperatorEnum,
  Filter,
  IntrospectionField,
  LogicalFilter,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../types/pagination';

export function buildGraphQlQuery(args: {
  type: 'ProcessDefinitions' | 'ProcessInstances' | 'Jobs';
  queryBody: string;
  whereClause?: string;
  pagination?: Pagination;
}): string {
  let query = `{${args.type}`;

  const whereClause = buildWhereClause(args.whereClause);
  const paginationClause = buildPaginationClause(args.pagination);

  if (whereClause || paginationClause) {
    query += ' (';
    query += [whereClause, paginationClause].filter(Boolean).join(', ');
    query += ') ';
  }

  query += ` {${args.queryBody} } }`;

  return query.replace(/\s+/g, ' ').trim();
}

function buildWhereClause(whereClause?: string): string {
  return whereClause ? `where: {${whereClause}}` : '';
}

function buildPaginationClause(pagination?: Pagination): string {
  if (!pagination) return '';

  const parts = [];

  if (pagination.sortField !== undefined) {
    parts.push(
      `orderBy: {${pagination.sortField}: ${pagination.order !== undefined ? pagination.order?.toUpperCase() : 'ASC'}}`,
    );
  }

  const paginationParts = [];
  if (pagination.limit !== undefined) {
    paginationParts.push(`limit: ${pagination.limit}`);
  }
  if (pagination.offset !== undefined) {
    paginationParts.push(`offset: ${pagination.offset}`);
  }
  if (paginationParts.length) {
    parts.push(`pagination: {${paginationParts.join(', ')}}`);
  }

  return parts.join(', ');
}

function isLogicalFilter(filter: Filter): filter is LogicalFilter {
  return (filter as LogicalFilter).filters !== undefined;
}

export function buildFilterCondition(
  introspection: IntrospectionField[],
  filters?: Filter,
): string {
  if (!filters) {
    return '';
  }

  if (isLogicalFilter(filters)) {
    if (filters.operator) {
      const subClauses =
        filters.filters.map(f => buildFilterCondition(introspection, f)) ?? [];
      const joinedSubClauses = `${filters.operator.toLowerCase()}: {${subClauses.join(', ')}}`;
      return joinedSubClauses;
    }
  }

  if (!isOperatorSupported(filters.operator)) {
    throw new Error(`Unsopported operator ${filters.operator}`);
  }

  const fieldDef = introspection.find(f => f.name === filters.field);
  if (!fieldDef) {
    throw new Error(`Can't find field "${filters.field}" definition`);
  }

  if (!isOperatorAllowedForField(filters.operator, fieldDef)) {
    throw new Error(`Unsupported field type ${fieldDef.type.name}`);
  }

  let value = filters.value;

  if (filters.operator === FieldFilterOperatorEnum.IsNull) {
    return `${filters.field}: {${getGraphQLOperator(filters.operator)}: ${convertToBoolean(value)}}`;
  }

  if (Array.isArray(value)) {
    value = `[${value.map(v => formatValue(filters.field, v, fieldDef)).join(', ')}]`;
  } else {
    value = formatValue(filters.field, value, fieldDef);
  }

  if (
    filters.operator === FieldFilterOperatorEnum.Eq ||
    filters.operator === FieldFilterOperatorEnum.Like ||
    filters.operator === FieldFilterOperatorEnum.In
  ) {
    return `${filters.field}: {${getGraphQLOperator(filters.operator)}: ${value}}`;
  }

  throw new Error(`Can't build filter condition`);
}

function isOperatorSupported(operator: FieldFilterOperatorEnum): boolean {
  return (
    operator === FieldFilterOperatorEnum.Eq ||
    operator === FieldFilterOperatorEnum.Like ||
    operator === FieldFilterOperatorEnum.In ||
    operator === FieldFilterOperatorEnum.IsNull
  );
}

function isFieldFilterSupported(fieldDef: IntrospectionField): boolean {
  return fieldDef?.type.name === TypeName.String;
}

function isOperatorAllowedForField(
  operator: FieldFilterOperatorEnum,
  fieldDef: IntrospectionField,
): boolean {
  const allowedOperators: Record<TypeName, FieldFilterOperatorEnum[]> = {
    [TypeName.String]: [
      FieldFilterOperatorEnum.In,
      FieldFilterOperatorEnum.Like,
      FieldFilterOperatorEnum.IsNull,
      FieldFilterOperatorEnum.Eq,
    ],
    [TypeName.Id]: [
      FieldFilterOperatorEnum.In,
      FieldFilterOperatorEnum.IsNull,
      FieldFilterOperatorEnum.Eq,
    ],
    [TypeName.Date]: [],
    [TypeName.StringArray]: [],
  };
  const allowedForType = allowedOperators[fieldDef.type.name];
  return allowedForType ? allowedForType.includes(operator) : false;
}

function convertToBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false; // Default to false for unsupported types
}

function formatValue(
  fieldName: string,
  fieldValue: any,
  fieldDef: IntrospectionField,
): string {
  if (!isFieldFilterSupported) {
    throw new Error(`Unsupported field type ${fieldDef.type.name}`);
  }

  if (
    fieldDef.type.name === TypeName.String ||
    fieldDef.type.name === TypeName.Id
  ) {
    return `"${fieldValue}"`;
  }
  throw new Error(
    `Failed to format value for ${fieldName} ${fieldValue} with type ${fieldDef.type.name}`,
  );
}

function getGraphQLOperator(operator: FieldFilterOperatorEnum): string {
  switch (operator) {
    case 'EQ':
      return 'equal';
    case 'LIKE':
      return 'like';
    case 'IN':
      return 'in';
    case 'IS_NULL':
      return 'isNull';
    // case 'GT':
    //   // return "greaterThan"
    // case 'GTE':
    //   return "greaterThanEqual"
    // case 'LT':
    //   return "lessThan"
    // case 'LTE':
    //  return "lessThanEqual"
    // case 'CONTAINS':
    //  return "contains"
    // case 'CONTAINS_ALL':
    // case 'CONTAINS_ANY':
    // case 'BETWEEN':
    // case 'FROM':
    // case 'TO':
    default:
      throw new Error(`Operation "${operator}" not supported`);
  }
}
