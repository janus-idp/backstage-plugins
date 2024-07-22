import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import { Box, Button, makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import WarningIcon from '@mui/icons-material/Warning';
import { RJSFValidationError } from '@rjsf/utils';

import { ConditionsFormRow } from './ConditionsFormRow';
import { criterias } from './const';
import {
  Condition,
  ConditionsData,
  RuleParamsErrors,
  RulesData,
} from './types';

const useStyles = makeStyles(theme => ({
  form: {
    padding: theme.spacing(2.5),
    paddingTop: 0,
    flexGrow: 1,
    overflow: 'auto',
  },
  addConditionButton: {
    color: theme.palette.primary.light,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '15px',
    alignItems: 'baseline',
    borderTop: `2px solid ${theme.palette.border}`,
    padding: theme.spacing(2.5),
    '& button': {
      textTransform: 'none',
    },
  },
}));

type ConditionFormProps = {
  conditionRulesData?: RulesData;
  conditionsFormVal?: ConditionsData;
  selPluginResourceType: string;
  onClose: () => void;
  onSave: (conditions?: ConditionsData) => void;
};

export const ConditionsForm = ({
  conditionRulesData,
  selPluginResourceType,
  conditionsFormVal,
  onClose,
  onSave,
}: ConditionFormProps) => {
  const classes = useStyles();
  const [conditions, setConditions] = React.useState<ConditionsData>(
    conditionsFormVal ?? {
      condition: {
        rule: '',
        resourceType: selPluginResourceType,
        params: {},
      },
    },
  );
  const [criteria, setCriteria] = React.useState<string>(
    Object.keys(conditions)[0] ?? criterias.condition,
  );
  const [errors, setErrors] = React.useState<RuleParamsErrors>();

  const handleSetErrors = (
    newErrors: RJSFValidationError[],
    currentCriteria: string,
    nestedCriteria?: string,
    nestedConditionIndex?: number,
    ruleIndex?: number,
    removeErrors = false,
  ) => {
    setErrors(prevErrors => {
      const updatedErrors: RuleParamsErrors = { ...prevErrors };

      let baseErrorKey = currentCriteria;
      if (nestedConditionIndex !== undefined) {
        baseErrorKey += `.${nestedConditionIndex}`;
      }
      if (nestedCriteria !== undefined) {
        baseErrorKey += `.${nestedCriteria}`;
      }
      if (ruleIndex !== undefined) {
        baseErrorKey += `.${ruleIndex}`;
      }

      if (removeErrors || newErrors.length === 0) {
        delete updatedErrors[baseErrorKey];
        Object.keys(updatedErrors).forEach(key => {
          if (key.startsWith(`${baseErrorKey}.`)) {
            delete updatedErrors[key];
          }
        });
      } else {
        updatedErrors[baseErrorKey] = newErrors;
      }

      return updatedErrors;
    });
  };

  const [removeAllClicked, setRemoveAllClicked] =
    React.useState<boolean>(false);

  const flattenConditions = (
    conditionData: Condition[],
  ): PermissionCondition[] => {
    const flatConditions: PermissionCondition[] = [];

    const processCondition = (condition: Condition) => {
      if ('rule' in condition) {
        flatConditions.push(condition);
      } else {
        if (condition.allOf) {
          condition.allOf.forEach(processCondition);
        }
        if (condition.anyOf) {
          condition.anyOf.forEach(processCondition);
        }
        if (condition.not) {
          if ('rule' in condition.not) {
            flatConditions.push(condition.not);
          } else {
            processCondition(condition.not);
          }
        }
      }
    };
    conditionData.forEach(processCondition);
    return flatConditions;
  };

  const isNoRuleSelected = () => {
    switch (criteria) {
      case criterias.condition:
        return !conditions.condition?.rule;
      case criterias.not: {
        const flatConditions = flattenConditions([conditions.not as Condition]);
        return flatConditions.some(c => !c.rule);
      }
      case criterias.allOf: {
        const flatConditions = flattenConditions(conditions.allOf || []);
        return flatConditions.some(c => !c.rule);
      }
      case criterias.anyOf: {
        const flatConditions = flattenConditions(conditions.anyOf || []);
        return flatConditions.some(c => !c.rule);
      }
      default:
        return true;
    }
  };

  const isSaveDisabled = () => {
    const hasErrors =
      errors && Object.keys(errors).some(key => errors[key].length > 0);

    if (removeAllClicked) return false;

    return (
      hasErrors ||
      isNoRuleSelected() ||
      Object.is(conditionsFormVal, conditions)
    );
  };

  const hasMultiLevelNestedConditions = (): boolean => {
    if (!Array.isArray(conditions[criteria as keyof ConditionsData])) {
      return false;
    }

    return (conditions[criteria as keyof ConditionsData] as Condition[])
      .filter(condition => !('rule' in condition))
      .some((firstLevelNestedCondition: Condition) => {
        const nestedConditionCriteria = Object.keys(
          firstLevelNestedCondition,
        )[0];
        return (
          Array.isArray(
            firstLevelNestedCondition[
              nestedConditionCriteria as keyof Condition
            ],
          ) &&
          (
            firstLevelNestedCondition[
              nestedConditionCriteria as keyof Condition
            ] as Condition[]
          ).some((con: Condition) => !('rule' in con))
        );
      });
  };

  return (
    <>
      <Box className={classes.form}>
        <ConditionsFormRow
          conditionRulesData={conditionRulesData}
          conditionRow={conditions}
          criteria={criteria}
          selPluginResourceType={selPluginResourceType}
          onRuleChange={newCondition => setConditions(newCondition)}
          setCriteria={setCriteria}
          handleSetErrors={handleSetErrors}
          setRemoveAllClicked={setRemoveAllClicked}
        />
        {hasMultiLevelNestedConditions() && (
          <Alert
            icon={<WarningIcon />}
            style={{ margin: '1.5rem 0 1rem 0' }}
            severity="warning"
            data-testid="multi-level-nested-conditions-warning"
          >
            <AlertTitle data-testid="multi-level-nested-conditions-warning-title">
              Multiple levels of nested conditions are not supported
            </AlertTitle>
            Only one level is displayed. Please use the{' '}
            <a
              href="https://github.com/redhat-developer/red-hat-developers-documentation-rhdh/blob/main/modules/admin/proc-rbac-send-request-rbac-rest-api.adoc"
              // TODO: Update link with the official documentation when RHIDP-3078 is resolved
              target="blank"
              style={{ textDecoration: 'underline' }}
            >
              CLI
            </a>{' '}
            to view all nested conditions.
          </Alert>
        )}
      </Box>
      <Box className={classes.footer}>
        <Button
          variant="contained"
          color="primary"
          data-testid="save-conditions"
          disabled={isSaveDisabled()}
          onClick={() => {
            if (removeAllClicked) {
              onSave(undefined);
            } else onSave(conditions);
          }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          data-testid="cancel-conditions"
        >
          Cancel
        </Button>
        <Button
          variant="text"
          color="primary"
          disabled={removeAllClicked || isNoRuleSelected()}
          onClick={() => {
            setRemoveAllClicked(true);
            setCriteria(criterias.condition);
            setConditions({
              condition: {
                rule: '',
                resourceType: selPluginResourceType,
                params: {},
              },
            });
          }}
          data-testid="remove-conditions"
        >
          Remove all
        </Button>
      </Box>
    </>
  );
};
