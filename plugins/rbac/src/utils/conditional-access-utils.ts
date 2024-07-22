import { PermissionCondition } from '@backstage/plugin-permission-common';

import { makeStyles } from '@material-ui/core';

import { conditionButtons } from '../components/ConditionalAccess/const';
import { Condition } from '../components/ConditionalAccess/types';

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
