import React from 'react';

import { makeStyles } from '@material-ui/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { ConditionsFormRow } from './ConditionsFormRow';
import { criterias } from './const';
import { ConditionsData, RuleParamsErrors, RulesData } from './types';

const useStyles = makeStyles(theme => ({
  form: {
    padding: theme.spacing(2.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    flexGrow: 1,
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

  const [removeAllClicked, setRemoveAllClicked] =
    React.useState<boolean>(false);

  const isNoRuleSelected = () => {
    switch (criteria) {
      case criterias.condition: {
        return !conditions.condition?.rule;
      }
      case criterias.not: {
        return !conditions.not?.rule;
      }
      case criterias.allOf: {
        return !!conditions.allOf?.find(c => !c.rule);
      }
      case criterias.anyOf: {
        return !!conditions.anyOf?.find(c => !c.rule);
      }
      default:
        return true;
    }
  };

  const isSaveDisabled = () => {
    const hasErrors = !!errors?.[criteria]?.length;

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
          setErrors={setErrors}
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
