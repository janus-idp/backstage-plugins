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
  allOf?: Condition[];
  anyOf?: Condition[];
  not?: Condition;
  condition?: PermissionCondition;
};

export type Condition = PermissionCondition | ConditionsData;

export type RuleParamsErrors = {
  [key: string]: RJSFValidationError[];
};

export type ConditionFormRowProps = {
  conditionRulesData?: RulesData;
  conditionRow: ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  selPluginResourceType: string;
  criteria: string;
  setCriteria: React.Dispatch<React.SetStateAction<string>>;
  handleSetErrors: (
    newErrors: RJSFValidationError[],
    currentCriteria: string,
    nestedCriteria?: string,
    conditionIndex?: number,
    nestedConditionRuleIndex?: number,
    removeErrors?: boolean,
  ) => void;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

export type NotConditionType = 'simple-condition' | 'nested-condition';
