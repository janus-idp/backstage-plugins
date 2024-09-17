import { BackstageUserInfo } from '@backstage/backend-plugin-api';
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

function isOwnerRefsAlias(value: PermissionRuleParam): boolean {
  const alias = `${CONDITION_ALIAS_SIGN}${ConditionalAliases.OWNER_REFS}`;
  return value === alias;
}

function isCurrentUserAlias(value: PermissionRuleParam): boolean {
  const alias = `${CONDITION_ALIAS_SIGN}${ConditionalAliases.CURRENT_USER}`;
  return value === alias;
}

function replaceAliasWithValue<
  K extends string,
  V extends JsonPrimitive | JsonPrimitive[],
>(
  params: Record<K, PermissionRuleParam> | undefined,
  key: K,
  predicate: Predicate<PermissionRuleParam>,
  newValue: V,
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
        const newValues = Array.isArray(newValue) ? newValue : [newValue];
        nonAliasValues.push(...newValues);
      } else {
        nonAliasValues.push(oldValue);
      }
    }
    return { ...params, [key]: nonAliasValues };
  }

  const oldValue = params[key] as JsonPrimitive;
  const isAliasMatched = predicate(oldValue);
  if (isAliasMatched && !Array.isArray(newValue)) {
    return { ...params, [key]: newValue };
  }

  return params;
}

export function replaceAliases(
  conditions: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  userInfo: BackstageUserInfo,
) {
  if ('not' in conditions) {
    replaceAliases(conditions.not, userInfo);
    return;
  }
  if ('allOf' in conditions) {
    for (const condition of conditions.allOf) {
      replaceAliases(condition, userInfo);
    }
    return;
  }
  if ('anyOf' in conditions) {
    for (const condition of conditions.anyOf) {
      replaceAliases(condition, userInfo);
      return;
    }
  }

  const params = (
    conditions as PermissionCondition<string, PermissionRuleParams>
  ).params;
  if (params) {
    for (const key of Object.keys(params)) {
      let modifiedParams = replaceAliasWithValue(
        params,
        key,
        isCurrentUserAlias,
        userInfo.userEntityRef,
      );

      modifiedParams = replaceAliasWithValue(
        modifiedParams,
        key,
        isOwnerRefsAlias,
        userInfo.ownershipEntityRefs,
      );

      (conditions as PermissionCondition<string, PermissionRuleParams>).params =
        modifiedParams;
    }
  }
}
