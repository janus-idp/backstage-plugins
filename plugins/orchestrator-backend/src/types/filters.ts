import { Request } from 'express-serve-static-core';

import { Filter } from '@janus-idp/backstage-plugin-orchestrator-common';

export const Operator = {
  Equal: 'equal',
  In: 'in',
} as const;

export type OperatorType = (typeof Operator)[keyof typeof Operator];

export interface FilterInfo {
  fieldName: string;
  operator: OperatorType;
  fieldValue: FilterValue;
}

export type FilterValue = boolean | number | string;

export function buildFilter(req: Request): Filter | undefined {
  if (!req.body.filters) {
    return undefined;
  }

  return req.body.filters as Filter;
}
