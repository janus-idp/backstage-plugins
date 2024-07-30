import { PermissionCondition } from '@backstage/plugin-permission-common';

import { makeStyles } from '@material-ui/core';
import { RJSFValidationError } from '@rjsf/utils';

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
  NotConditionType,
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
