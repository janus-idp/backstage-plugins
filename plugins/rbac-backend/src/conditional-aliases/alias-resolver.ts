import {
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParam,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';
import { JsonPrimitive } from '@backstage/types';

import {
  CONDITION_ALIAS_SIGN,
  ConditionalAliases,
} from '@janus-idp/backstage-plugin-rbac-common';

interface Predicate<T> {
  (item: T): boolean;
}

function isCurrentUserAlias(value: PermissionRuleParam): boolean {
  const alias = `${CONDITION_ALIAS_SIGN}${ConditionalAliases.CURRENT_USER}`;
  return value === alias;
}

function replaceAliasWithValue<K extends string>(
  params: Record<K, PermissionRuleParam> | undefined,
  key: K,
  predicate: Predicate<PermissionRuleParam>,
  newValues: JsonPrimitive[],
): Record<K, PermissionRuleParam> | undefined {
  if (!params) {
    return params;
  }

  if (Array.isArray(params[key])) {
    const oldValues = params[key] as JsonPrimitive[];
    const nonAliasValues: JsonPrimitive[] = [];
    for (const oldValue of oldValues) {
      const isAliasMatched = predicate(oldValue);
      if (isAliasMatched) {
        nonAliasValues.push(...newValues);
      } else {
        nonAliasValues.push(oldValue);
      }
    }
    return { ...params, [key]: nonAliasValues };
  }

  return params;
}

export function replaceAliases(
  conditions: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  ownershipEntityRefs: string[],
) {
  if ('not' in conditions) {
    replaceAliases(conditions.not, ownershipEntityRefs);
    return;
  }
  if ('allOf' in conditions) {
    for (const condition of conditions.allOf) {
      replaceAliases(condition, ownershipEntityRefs);
    }
    return;
  }
  if ('anyOf' in conditions) {
    for (const condition of conditions.anyOf) {
      replaceAliases(condition, ownershipEntityRefs);
      return;
    }
  }

  const params = (
    conditions as PermissionCondition<string, PermissionRuleParams>
  ).params;
  if (params) {
    for (const key of Object.keys(params)) {
      const paramsWithoutAliases = replaceAliasWithValue(
        params,
        key,
        isCurrentUserAlias,
        ownershipEntityRefs,
      );
      (conditions as PermissionCondition<string, PermissionRuleParams>).params =
        paramsWithoutAliases;
    }
  }
}
