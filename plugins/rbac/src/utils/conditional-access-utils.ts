import { PermissionCondition } from '@backstage/plugin-permission-common';

import { makeStyles } from '@material-ui/core';

import {
  conditionButtons,
  criterias,
} from '../components/ConditionalAccess/const';
import {
  AccessConditionsErrors,
  ComplexErrors,
  Condition,
  ConditionsData,
  NestedCriteriaErrors,
} from '../components/ConditionalAccess/types';

export const ruleOptionDisabled = (
  ruleOption: string,
  conditions?: PermissionCondition[],
) => {
  return !!(conditions || []).find(con => con.rule === ruleOption);
};

export const nestedConditionButtons = conditionButtons.filter(
  button => button.val !== 'condition',
);

export const extractNestedConditions = (
  conditions: Condition[],
  criteriaTypes: string[],
  nestedConditions: Condition[],
) => {
  conditions.forEach(c => {
    criteriaTypes.forEach(ct => {
      if (Object.keys(c).includes(ct)) {
        nestedConditions.push(c);
      }
    });
  });
};

export const getDefaultRule = (selPluginResourceType: string) => ({
  rule: '',
  resourceType: selPluginResourceType,
  params: {},
});

export const useConditionsFormRowStyles = makeStyles(theme => ({
  conditionRow: {
    padding: '20px',
    border: `1px solid ${theme.palette.border}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    '& input': {
      color: `${theme.palette.textContrast}!important`,
      '&:-internal-autofill-selected, &:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active':
        {
          WebkitBoxShadow: `0 0 0px 1000px ${theme.palette.background.paper} inset`,
          WebkitTextFillColor: `${theme.palette.textContrast}!important`,
          caretColor: `${theme.palette.textContrast}!important`,
        },
    },
    '& button': {
      textTransform: 'none',
    },
  },
  nestedConditionRow: {
    padding: '20px',
    marginLeft: theme.spacing(3),
    border: `1px solid ${theme.palette.border}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    '& input': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
  },
  criteriaButtonGroup: {
    backgroundColor: theme.palette.background.paper,
    width: '80%',
  },
  criteriaButton: {
    width: '100%',
    padding: `${theme.spacing(1)}px !important`,
  },
  nestedConditioncriteriaButtonGroup: {
    backgroundColor: theme.palette.background.paper,
    width: '60%',
    height: '100%',
  },
  addRuleButton: {
    display: 'flex !important',
    color: theme.palette.primary.light,
    textTransform: 'none',
  },
  addNestedConditionButton: {
    display: 'flex !important',
    color: theme.palette.primary.light,
    textTransform: 'none',
  },
  removeRuleButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
    alignSelf: 'baseline',
    marginTop: theme.spacing(3.3),
  },
  removeNestedRuleButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
    alignSelf: 'baseline',
  },
  radioGroup: {
    margin: theme.spacing(1),
  },
  radioLabel: {
    marginTop: theme.spacing(1),
  },
}));

export const calculateConditionIndex = (
  conditionRow: ConditionsData,
  nestedConditionIndex: number,
  criteria: string,
): number => {
  const simpleRulesCount =
    criteria === criterias.not
      ? 0
      : (
          (conditionRow[criteria as keyof Condition] as Condition[]) || []
        ).filter((e: Condition) => 'rule' in e).length;

  return simpleRulesCount + nestedConditionIndex;
};

export const initializeErrors = (
  criteria: string,
  conditions: ConditionsData,
): AccessConditionsErrors => {
  const errors: AccessConditionsErrors = {};
  const initialize = (cond: Condition | ConditionsData): ComplexErrors => {
    if ('rule' in cond) {
      return '';
    }

    const nestedErrors: NestedCriteriaErrors = {};
    if (cond.allOf) {
      nestedErrors.allOf = (cond.allOf.map(initialize) as string[]) || [];
    }
    if (cond.anyOf) {
      nestedErrors.anyOf = (cond.anyOf.map(initialize) as string[]) || [];
    }
    if (cond.not) {
      nestedErrors.not = (initialize(cond.not) as string) || '';
    }

    return nestedErrors;
  };

  if (criteria === 'condition') {
    errors.condition = '';
  } else if (criteria === 'not') {
    const notCondition = conditions.not;

    let notConditionType;
    if (notCondition === undefined) {
      notConditionType = 'simple-condition';
    } else if ('rule' in notCondition) {
      notConditionType = 'simple-condition';
    } else {
      notConditionType = 'nested-condition';
    }

    if (notConditionType === 'simple-condition') {
      errors.not = '';
    } else {
      errors.not = initialize(conditions.not!);
    }
  } else if (criteria === 'allOf' || criteria === 'anyOf') {
    errors[criteria] = conditions[criteria]!.map(initialize);
  }

  return errors;
};

export const resetErrors = (
  criteria: string,
  notConditionType = 'simple-condition',
): AccessConditionsErrors => {
  const errors: AccessConditionsErrors = {};

  if (
    criteria === criterias.condition ||
    (criteria === criterias.not && notConditionType === 'simple-condition')
  ) {
    errors[criteria] = '';
  }

  if (criteria === criterias.allOf || criteria === criterias.anyOf) {
    errors[criteria] = [''] as ComplexErrors[];
  }

  if (criteria === criterias.not && notConditionType === 'nested-condition') {
    (errors[criteria] as ComplexErrors) = { [criterias.allOf]: [''] };
  }

  return errors;
};

export const isNestedConditionRule = (r: Condition): boolean => {
  return (
    criterias.allOf in (r as ConditionsData) ||
    criterias.anyOf in (r as ConditionsData) ||
    criterias.not in (r as ConditionsData)
  );
};

export const getRowStyle = (c: Condition, isNestedCondition: boolean) =>
  isNestedCondition
    ? {
        display:
          (c as PermissionCondition).rule !== undefined ? 'flex' : 'none',
      }
    : { display: 'flex', gap: '10px' };

export const getRowKey = (isNestedCondition: boolean, ruleIndex: number) =>
  isNestedCondition
    ? `nestedCondition-rule-${ruleIndex}`
    : `condition-rule-${ruleIndex}`;

export const hasAllOfOrAnyOfErrors = (
  errors: AccessConditionsErrors,
  criteria: string,
): boolean => {
  if (!errors) return false;

  const criteriaErrors = errors[
    criteria as keyof AccessConditionsErrors
  ] as ComplexErrors[];
  const simpleRuleErrors = criteriaErrors.filter(
    e => typeof e === 'string',
  ) as string[];
  const nestedRuleErrors = criteriaErrors.filter(
    e => typeof e !== 'string',
  ) as NestedCriteriaErrors[];

  if (simpleRuleErrors.some(e => e.length > 0)) {
    return true;
  }

  return nestedRuleErrors.some(err => {
    const nestedCriteria = Object.keys(err)[0] as keyof NestedCriteriaErrors;
    const nestedErrors = err[nestedCriteria];

    if (Array.isArray(nestedErrors)) {
      return nestedErrors.some(e => e.length > 0);
    }
    return nestedErrors?.length > 0;
  });
};

export const hasSimpleConditionOrNotErrors = (
  errors: AccessConditionsErrors,
  criteria: string,
): boolean => {
  if (!errors) return false;
  return (
    ((errors[criteria as keyof AccessConditionsErrors] as string) || '')
      .length > 0
  );
};

export const hasSimpleNotRule = (
  conditions: ConditionsData,
  criteria: string,
): boolean => {
  return Object.keys(conditions[criteria as keyof ConditionsData]!).includes(
    'rule',
  );
};

export const hasNestedNotErrors = (
  errors: AccessConditionsErrors,
  conditions: ConditionsData,
  criteria: string,
): boolean => {
  if (!errors) return false;
  const nestedCriteria = Object.keys(
    conditions[criteria as keyof ConditionsData]!,
  )[0] as keyof ConditionsData;
  const nestedErrors = (
    errors[
      criterias.not as keyof AccessConditionsErrors
    ] as NestedCriteriaErrors
  )[nestedCriteria];

  if (Array.isArray(nestedErrors)) {
    return nestedErrors.some(e => e.length > 0);
  }
  return nestedErrors?.length > 0;
};
