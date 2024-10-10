import {
  FieldFilter,
  FieldFilterOperatorEnum,
  Filter,
  IntrospectionField,
  LogicalFilter,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

function isLogicalFilter(filter: Filter): filter is LogicalFilter {
  return (filter as LogicalFilter).filters !== undefined;
}

function handleLogicalFilter(
  introspection: IntrospectionField[],
  filter: LogicalFilter,
): string {
  if (!filter.operator) return '';

  const subClauses = filter.filters.map(f =>
    buildFilterCondition(introspection, f),
  );

  return `${filter.operator.toLowerCase()}: {${subClauses.join(', ')}}`;
}

function handleBetweenOperator(filter: FieldFilter): string {
  if (!Array.isArray(filter.value) || filter.value.length !== 2) {
    throw new Error('Between operator requires an array of two elements');
  }
  return `${filter.field}: {${getGraphQLOperator(FieldFilterOperatorEnum.Between)}: {from: "${filter.value[0]}", to: "${filter.value[1]}"}}`;
}

function handleIsNullOperator(filter: FieldFilter): string {
  return `${filter.field}: {${getGraphQLOperator(FieldFilterOperatorEnum.IsNull)}: ${convertToBoolean(filter.value)}}`;
}

function handleBinaryOperator(
  binaryFilter: FieldFilter,
  fieldDef: IntrospectionField,
): string {
  const formattedValue = Array.isArray(binaryFilter.value)
    ? `[${binaryFilter.value.map(v => formatValue(binaryFilter.field, v, fieldDef)).join(', ')}]`
    : formatValue(binaryFilter.field, binaryFilter.value, fieldDef);

  return `${binaryFilter.field}: {${getGraphQLOperator(binaryFilter.operator)}: ${formattedValue}}`;
}

export function buildFilterCondition(
  introspection: IntrospectionField[],
  filters?: Filter,
): string {
  if (!filters) {
    return '';
  }

  if (isLogicalFilter(filters)) {
    return handleLogicalFilter(introspection, filters);
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

  switch (filters.operator) {
    case FieldFilterOperatorEnum.IsNull:
      return handleIsNullOperator(filters);
    case FieldFilterOperatorEnum.Between:
      return handleBetweenOperator(filters);
    case FieldFilterOperatorEnum.Eq:
    case FieldFilterOperatorEnum.Like:
    case FieldFilterOperatorEnum.In:
    case FieldFilterOperatorEnum.Gt:
    case FieldFilterOperatorEnum.Gte:
    case FieldFilterOperatorEnum.Lt:
    case FieldFilterOperatorEnum.Lte:
      return handleBinaryOperator(filters, fieldDef);

    default:
      throw new Error(`Can't build filter condition`);
  }
}

function isOperatorSupported(operator: FieldFilterOperatorEnum): boolean {
  return (
    operator === FieldFilterOperatorEnum.Eq ||
    operator === FieldFilterOperatorEnum.Like ||
    operator === FieldFilterOperatorEnum.In ||
    operator === FieldFilterOperatorEnum.IsNull ||
    operator === FieldFilterOperatorEnum.Gt ||
    operator === FieldFilterOperatorEnum.Gte ||
    operator === FieldFilterOperatorEnum.Lt ||
    operator === FieldFilterOperatorEnum.Lte ||
    operator === FieldFilterOperatorEnum.Between
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
    [TypeName.Date]: [
      FieldFilterOperatorEnum.IsNull,
      FieldFilterOperatorEnum.Eq,
      FieldFilterOperatorEnum.Gt,
      FieldFilterOperatorEnum.Gte,
      FieldFilterOperatorEnum.Lt,
      FieldFilterOperatorEnum.Lte,
      FieldFilterOperatorEnum.Between,
    ],
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
    fieldDef.type.name === TypeName.Id ||
    fieldDef.type.name === TypeName.Date
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
    case 'GT':
      return 'greaterThan';
    case 'GTE':
      return 'greaterThanEqual';
    case 'LT':
      return 'lessThan';
    case 'LTE':
      return 'lessThanEqual';
    // case 'CONTAINS':
    //  return "contains"
    // case 'CONTAINS_ALL':
    // case 'CONTAINS_ANY':
    case 'BETWEEN':
      return 'between';
    default:
      throw new Error(`Operation "${operator}" not supported`);
  }
}
