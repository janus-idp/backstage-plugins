import { PermissionCondition } from '@backstage/plugin-permission-common';

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

export type ComplexErrors = string | NestedCriteriaErrors;

export type NestedCriteriaErrors = {
  [nestedCriteria: string]: string[] | string;
};

export type AccessConditionsErrors = {
  [criteria: string]: ComplexErrors[] | NestedCriteriaErrors | string;
};

export type ConditionFormRowProps = {
  conditionRulesData?: RulesData;
  conditionRow: ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  selPluginResourceType: string;
  criteria: string;
  setCriteria: React.Dispatch<React.SetStateAction<string>>;
  setErrors: React.Dispatch<
    React.SetStateAction<AccessConditionsErrors | undefined>
  >;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

export type NotConditionType = 'simple-condition' | 'nested-condition';
