import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { getDefaultRule } from '../../utils/conditional-access-utils';
import { AddNestedConditionButton } from './AddNestedConditionButton';
import { criterias } from './const';
import { Condition, ConditionsData } from './types';

type ComplexConditionRowButtonsProps = {
  conditionRow: ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  criteria: string;
  classes: any;
  selPluginResourceType: string;
  updateErrors: (_index: number) => void;
  isNestedConditionRule: (condition: Condition) => boolean;
  handleAddNestedCondition: (criteria: string) => void;
};

export const ComplexConditionRowButtons = ({
  conditionRow,
  onRuleChange,
  criteria,
  classes,
  selPluginResourceType,
  updateErrors,
  isNestedConditionRule,
  handleAddNestedCondition,
}: ComplexConditionRowButtonsProps) => {
  const findFirstNestedConditionIndex = (rules: Condition[]): number => {
    return rules.findIndex(e => isNestedConditionRule(e)) || 0;
  };
  const handleAddRule = () => {
    const updatedRules = [
      ...(conditionRow.allOf ?? []),
      ...(conditionRow.anyOf ?? []),
    ];

    const firstNestedConditionIndex =
      findFirstNestedConditionIndex(updatedRules);
    if (firstNestedConditionIndex !== -1) {
      updatedRules.splice(
        firstNestedConditionIndex,
        0,
        getDefaultRule(selPluginResourceType),
      );
    } else {
      updatedRules.push(getDefaultRule(selPluginResourceType));
    }

    onRuleChange({ [criteria]: [...updatedRules] });
    updateErrors(firstNestedConditionIndex);
  };

  return (
    (criteria === criterias.allOf || criteria === criterias.anyOf) && (
      <Box mt={1} mb={1}>
        <Button
          className={classes.addRuleButton}
          size="small"
          onClick={handleAddRule}
        >
          <AddIcon fontSize="small" />
          Add rule
        </Button>
        <Button
          className={classes.addNestedConditionButton}
          size="small"
          onClick={() => handleAddNestedCondition(criteria)}
        >
          <AddIcon fontSize="small" />
          <AddNestedConditionButton />
        </Button>
      </Box>
    )
  );
};
