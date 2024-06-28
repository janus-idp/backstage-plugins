import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import { makeStyles } from '@material-ui/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    flexGrow: 1,
    overflowY: 'auto',
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
      </Box>
      <Box className={classes.footer}>
        <Button
          variant="contained"
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
          onClick={onClose}
          data-testid="cancel-conditions"
        >
          Cancel
        </Button>
        <Button
          variant="text"
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
