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
  onSave: (conditions: ConditionsData) => void;
  onRemoveAll: () => void;
};

export const ConditionsForm = ({
  conditionRulesData,
  selPluginResourceType,
  conditionsFormVal,
  onClose,
  onSave,
  onRemoveAll,
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

  const isSaveDisabled = () => {
    const hasErrors = !!errors?.[criteria]?.length;
    let noRuleSelected;
    switch (criteria) {
      case criterias.condition: {
        noRuleSelected = !conditions.condition?.rule;
        break;
      }
      case criterias.not: {
        noRuleSelected = !conditions.not?.rule;
        break;
      }
      case criterias.allOf: {
        noRuleSelected = !!conditions.allOf?.find(c => !c.rule);
        break;
      }
      case criterias.anyOf: {
        noRuleSelected = !!conditions.anyOf?.find(c => !c.rule);
        break;
      }
      default:
        noRuleSelected = true;
    }
    return hasErrors || noRuleSelected;
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
        />
      </Box>
      <Box className={classes.footer}>
        <Button
          variant="contained"
          data-testid="save-conditions"
          disabled={isSaveDisabled()}
          onClick={() => {
            onSave(conditions);
          }}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setCriteria(criterias.condition);
            setConditions({
              condition: {
                rule: '',
                resourceType: selPluginResourceType,
                params: {},
              },
            });
            onRemoveAll();
          }}
        >
          Remove all
        </Button>
      </Box>
    </>
  );
};
