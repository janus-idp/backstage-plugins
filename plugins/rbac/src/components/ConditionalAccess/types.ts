import { PermissionCondition } from '@backstage/plugin-permission-common';

import { RJSFValidationError } from '@rjsf/utils';

export type RulesData = {
  rules: string[];
  [rule: string]: {
    [key: string]: any;
  };
};

export type ResourceTypeRuleData = {
  [resourceType: string]: RulesData;
};

export type ConditionRulesData = {
  [plugin: string]: ResourceTypeRuleData;
};

export type ConditionRules = {
  data?: ConditionRulesData;
  error?: Error;
};

export type ConditionsData = {
  allOf?: PermissionCondition[];
  anyOf?: PermissionCondition[];
  not?: PermissionCondition;
  condition?: PermissionCondition;
};

export type RuleParamsErrors = {
  [key: string]: RJSFValidationError[];
};
