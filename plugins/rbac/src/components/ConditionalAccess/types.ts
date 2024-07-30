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

// export type RuleParamsErrors = {
//   [key: string]: RJSFValidationError[];
// };

// export type ComplexErrors = RJSFValidationError | NestedCriteriaErrors | {};
export type ComplexErrors = string | NestedCriteriaErrors;
// => string | NestedCriteriaErrors

export type NestedCriteriaErrors = {
  // [nestedCriteria: string]: (RJSFValidationError | {})[] | RJSFValidationError; // => string[] | string
  [nestedCriteria: string]: string[] | string;
  // allOf: RJSFValidationError[]; => string[]
  // anyOf: RJSFValidationError[]; => string[]
  // not: RJSFValidationError; => string
};

export type AccessConditionsErrors = {
  // [criteria: string]: ComplexErrors[] | RJSFValidationError | {};
  [criteria: string]: ComplexErrors[] | NestedCriteriaErrors | string;
  // condition: RJSFValidationError; => string
  // not(simple): RJSFValidationError; => string
  // not(nested): NestedCriteriaErrors; => NestedCriteriaErrors
  // allOf: ComplexErrors[]
  // anyOf: ComplexErrors[]
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
