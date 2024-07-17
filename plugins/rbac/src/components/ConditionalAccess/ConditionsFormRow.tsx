import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import { IconButton, makeStyles, useTheme } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { conditionButtons, criterias } from './const';
import { ConditionsData, RuleParamsErrors, RulesData } from './types';

const useStyles = makeStyles(theme => ({
  conditionRow: {
    padding: '20px',
    border: `1px solid ${theme.palette.border}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    '& input': {
      backgroundColor: `${theme.palette.background.default}!important`,
      color: `${theme.palette.textContrast}!important`,
    },
    '& button': {
      textTransform: 'none',
    },
  },
  criteriaButtonGroup: {
    backgroundColor: 'inherit',
    width: '80%',
  },
  criteriaButton: {
    width: '100%',
    padding: `${theme.spacing(1)}px !important`,
  },
  addRuleButton: {
    color: theme.palette.primary.light,
    marginTop: theme.spacing(1),
  },
  removeRuleButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
    alignSelf: 'baseline',
    marginTop: theme.spacing(3.3),
  },
}));

type ConditionFormRowProps = {
  conditionRulesData?: RulesData;
  conditionRow: ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  selPluginResourceType: string;
  criteria: string;
  setCriteria: React.Dispatch<React.SetStateAction<string>>;
  setErrors: React.Dispatch<React.SetStateAction<RuleParamsErrors | undefined>>;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ConditionsFormRow = ({
  conditionRulesData,
  conditionRow,
  selPluginResourceType,
  criteria,
  onRuleChange,
  setCriteria,
  setErrors,
  setRemoveAllClicked,
}: ConditionFormRowProps) => {
  const classes = useStyles();
  const theme = useTheme();

  const handleCriteriaChange = (val: string) => {
    setCriteria(val);
    switch (val) {
      case criterias.condition: {
        onRuleChange({
          condition: {
            rule: '',
            resourceType: selPluginResourceType,
            params: {},
          },
        });
        break;
      }
      case criterias.allOf: {
        onRuleChange({
          allOf: [
            {
              rule: '',
              resourceType: selPluginResourceType,
              params: {},
            },
          ],
        });
        break;
      }
      case criterias.anyOf: {
        onRuleChange({
          anyOf: [
            {
              rule: '',
              resourceType: selPluginResourceType,
              params: {},
            },
          ],
        });
        break;
      }
      case criterias.not: {
        onRuleChange({
          not: {
            rule: '',
            resourceType: selPluginResourceType,
            params: {},
          },
        });
        break;
      }
      default:
    }
  };

  const ruleOptionDisabled = (
    ruleOption: string,
    conditions?: PermissionCondition[],
  ) => {
    return !!(conditions || []).find(con => con.rule === ruleOption);
  };

  return (
    <Box className={classes.conditionRow} data-testid="conditions-row">
      <ToggleButtonGroup
        exclusive
        value={criteria}
        onChange={(_event, newCriteria) => handleCriteriaChange(newCriteria)}
        className={classes.criteriaButtonGroup}
      >
        {conditionButtons.map(({ val, label }) => (
          <ToggleButton
            key={val}
            value={val}
            style={
              val === criteria
                ? {
                    color: theme.palette.infoText,
                    backgroundColor: theme.palette.infoBackground,
                  }
                : {}
            }
            className={classes.criteriaButton}
            disabled={val === criteria}
            size="large"
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {(criteria === criterias.allOf || criteria === criterias.anyOf) && (
        <Box>
          {criteria === criterias.allOf &&
            conditionRow.allOf?.map((c, index) => (
              <div style={{ display: 'flex', gap: '10px' }} key={index}>
                <ConditionsFormRowFields
                  oldCondition={c}
                  index={index}
                  onRuleChange={onRuleChange}
                  conditionRow={conditionRow}
                  criteria={criteria}
                  conditionRulesData={conditionRulesData}
                  setErrors={setErrors}
                  setRemoveAllClicked={setRemoveAllClicked}
                />
                <IconButton
                  title="Remove"
                  className={classes.removeRuleButton}
                  disabled={(conditionRow.allOf ?? []).length === 1}
                  onClick={() => {
                    const rules = (conditionRow.allOf || []).filter(
                      (_r, rindex) => index !== rindex,
                    );
                    onRuleChange({ allOf: rules });
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              </div>
            ))}
          {criteria === criterias.anyOf &&
            conditionRow.anyOf?.map((c, index) => (
              <div style={{ display: 'flex' }} key={index}>
                <ConditionsFormRowFields
                  oldCondition={c}
                  index={index}
                  onRuleChange={onRuleChange}
                  conditionRow={conditionRow}
                  criteria={criteria}
                  conditionRulesData={conditionRulesData}
                  setErrors={setErrors}
                  setRemoveAllClicked={setRemoveAllClicked}
                />
                <IconButton
                  title="Remove"
                  className={classes.removeRuleButton}
                  disabled={(conditionRow.anyOf ?? []).length === 1}
                  onClick={() => {
                    const rules = (conditionRow.anyOf || []).filter(
                      (_r, rindex) => index !== rindex,
                    );
                    onRuleChange({ anyOf: rules });
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              </div>
            ))}
          <Button
            className={classes.addRuleButton}
            size="small"
            onClick={() =>
              onRuleChange({
                [criteria]: [
                  ...(conditionRow.allOf ?? []),
                  ...(conditionRow.anyOf ?? []),
                  {
                    rule: '',
                    resourceType: selPluginResourceType,
                    params: {},
                  },
                ],
              })
            }
          >
            <AddIcon fontSize="small" />
            Add rule
          </Button>
        </Box>
      )}
      {criteria === criterias.condition && (
        <ConditionsFormRowFields
          oldCondition={
            conditionRow.condition ?? {
              rule: '',
              resourceType: selPluginResourceType,
              params: {},
            }
          }
          onRuleChange={onRuleChange}
          conditionRow={conditionRow}
          criteria={criteria}
          conditionRulesData={conditionRulesData}
          setErrors={setErrors}
          optionDisabled={ruleOption =>
            ruleOptionDisabled(
              ruleOption,
              conditionRow.condition ? [conditionRow.condition] : undefined,
            )
          }
          setRemoveAllClicked={setRemoveAllClicked}
        />
      )}
      {criteria === criterias.not && (
        <ConditionsFormRowFields
          oldCondition={
            conditionRow.not ?? {
              rule: '',
              resourceType: selPluginResourceType,
              params: {},
            }
          }
          onRuleChange={onRuleChange}
          conditionRow={conditionRow}
          criteria={criteria}
          conditionRulesData={conditionRulesData}
          setErrors={setErrors}
          optionDisabled={ruleOption =>
            ruleOptionDisabled(
              ruleOption,
              conditionRow.not ? [conditionRow.not] : undefined,
            )
          }
          setRemoveAllClicked={setRemoveAllClicked}
        />
      )}
    </Box>
  );
};
