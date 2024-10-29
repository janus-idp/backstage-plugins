import {
  FieldFilter,
  FieldFilterOperatorEnum,
  Filter,
  IntrospectionField,
  LogicalFilter,
  ProcessInstanceStatusDTO,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { getProcessInstanceStateFromStatusDTOString } from '../service/api/mapping/V2Mappings';

type ProcessType = 'ProcessDefinition' | 'ProcessInstance';

function isLogicalFilter(filter: Filter): filter is LogicalFilter {
  return (filter as LogicalFilter).filters !== undefined;
}

function handleLogicalFilter(
  introspection: IntrospectionField[],
  type: ProcessType,
  filter: LogicalFilter,
): string {
  if (!filter.operator) return '';

  const subClauses = filter.filters.map(f =>
    buildFilterCondition(introspection, type, f),
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

function isEnumFilter(
  fieldName: string,
  type: 'ProcessDefinition' | 'ProcessInstance',
): boolean {
  if (type === 'ProcessInstance') {
    if (fieldName === 'state') {
      return true;
    }
  }
  return false;
}

function convertEnumValue(
  fieldName: string,
  fieldValue: string,
  type: 'ProcessDefinition' | 'ProcessInstance',
): string {
  if (type === 'ProcessInstance') {
    if (fieldName === 'state') {
      const state = (ProcessInstanceStatusDTO as any)[
        fieldValue as keyof typeof ProcessInstanceStatusDTO
      ];

      if (!state) {
        throw new Error(
          `status ${fieldValue} is not a valid value of ProcessInstanceStatusDTO`,
        );
      }
      return getProcessInstanceStateFromStatusDTOString(state).valueOf();
    }
  }
  throw new Error(
    `Unsupported enum ${fieldName}: can't convert value ${fieldValue}`,
  );
}

function isValidEnumOperator(operator: FieldFilterOperatorEnum): boolean {
  return (
    operator === FieldFilterOperatorEnum.In ||
    operator === FieldFilterOperatorEnum.Eq
  );
}

function handleBinaryOperator(
  binaryFilter: FieldFilter,
  fieldDef: IntrospectionField,
  type: 'ProcessDefinition' | 'ProcessInstance',
): string {
  if (isEnumFilter(binaryFilter.field, type)) {
    if (!isValidEnumOperator(binaryFilter.operator)) {
      throw new Error(
        `Invalid operator ${binaryFilter.operator} for enum field ${binaryFilter.field} filter`,
      );
    }
    binaryFilter.value = convertEnumValue(
      binaryFilter.field,
      binaryFilter.value,
      type,
    );
  }
  const formattedValue = Array.isArray(binaryFilter.value)
    ? `[${binaryFilter.value.map(v => formatValue(binaryFilter.field, v, fieldDef, type)).join(', ')}]`
    : formatValue(binaryFilter.field, binaryFilter.value, fieldDef, type);
  return `${binaryFilter.field}: {${getGraphQLOperator(binaryFilter.operator)}: ${formattedValue}}`;
}

export function buildFilterCondition(
  introspection: IntrospectionField[],
  type: ProcessType,
  filters?: Filter,
): string {
  if (!filters) {
    return '';
  }

  if (isLogicalFilter(filters)) {
    return handleLogicalFilter(introspection, type, filters);
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
      return handleBinaryOperator(filters, fieldDef, type);

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
  type: ProcessType,
): string {
  if (!isFieldFilterSupported) {
    throw new Error(`Unsupported field type ${fieldDef.type.name}`);
  }

  if (isEnumFilter(fieldName, type)) {
    return `${fieldValue}`;
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
