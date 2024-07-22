import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import {
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  useTheme,
} from '@material-ui/core';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {
  extractNestedConditions,
  getDefaultRule,
  nestedConditionButtons,
  ruleOptionDisabled,
  useConditionsFormRowStyles,
} from '../../utils/conditional-access-utils';
import { AddNestedConditionButton } from './AddNestedConditionButton';
import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { conditionButtons, criterias } from './const';
import { CriteriaToggleButton } from './CriteriaToggleButton';
import {
  Condition,
  ConditionFormRowProps,
  ConditionsData,
  NotConditionType,
} from './types';

export const ConditionsFormRow = ({
  conditionRulesData,
  conditionRow,
  selPluginResourceType,
  criteria,
  onRuleChange,
  setCriteria,
  handleSetErrors,
  setRemoveAllClicked,
}: ConditionFormRowProps) => {
  const classes = useConditionsFormRowStyles();
  const theme = useTheme();
  const [nestedConditionRow, setNestedConditionRow] = React.useState<
    Condition[]
  >([]);
  const [notConditionType, setNotConditionType] =
    React.useState<NotConditionType>('simple-condition');

  React.useEffect(() => {
    const nestedConditions: Condition[] = [];
    const criteriaTypes = [criterias.allOf, criterias.anyOf, criterias.not];
    switch (criteria) {
      case criterias.allOf:
        extractNestedConditions(
          (conditionRow.allOf as Condition[]) || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.anyOf:
        extractNestedConditions(
          (conditionRow.anyOf as Condition[]) || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.not:
        if (
          criteriaTypes.includes(Object.keys(conditionRow.not as Condition)[0])
        ) {
          nestedConditions.push(conditionRow.not as Condition);
          setNotConditionType('nested-condition');
        }
        break;
      default:
        break;
    }

    setNestedConditionRow(nestedConditions);
  }, [conditionRow, criteria]);

  const handleCriteriaChange = (val: string) => {
    handleSetErrors([], criteria, undefined, undefined, undefined, true);
    setCriteria(val);

    const defaultRule = getDefaultRule(selPluginResourceType);

    const ruleMap = {
      [criterias.condition]: { condition: defaultRule },
      [criterias.allOf]: { allOf: [defaultRule] },
      [criterias.anyOf]: { anyOf: [defaultRule] },
      [criterias.not]: { not: defaultRule },
    };

    if (val === criterias.not) {
      setNotConditionType('simple-condition');
    }

    const ruleChange = ruleMap[val];
    if (ruleChange) {
      onRuleChange(ruleChange);
    }
  };

  const updateRules = (updatedNestedConditionRow: Condition[] | Condition) => {
    const existingSimpleCondition =
      criteria !== criterias.not
        ? (conditionRow[criteria as keyof Condition] as Condition[])?.filter(
            con => Object.keys(con).includes('rule'),
          ) || []
        : [];

    const newCondition: Condition[] = Array.isArray(updatedNestedConditionRow)
      ? [...existingSimpleCondition, ...updatedNestedConditionRow]
      : [...existingSimpleCondition, updatedNestedConditionRow];

    if (criteria === criterias.anyOf || criteria === criterias.allOf) {
      onRuleChange({
        [criteria]: newCondition,
      });
    } else if (criteria === criterias.not) {
      onRuleChange({
        not: updatedNestedConditionRow as Condition,
      });
    }
  };

  const handleNestedConditionCriteriaChange = (
    val: string,
    nestedConditionIndex: number,
  ) => {
    handleSetErrors(
      [],
      criteria,
      undefined,
      nestedConditionIndex,
      undefined,
      true,
    );
    const defaultRule = getDefaultRule(selPluginResourceType);

    const nestedConditionMap = {
      [criterias.not]: { [val]: defaultRule },
      [criterias.allOf]: { [val]: [defaultRule] },
      [criterias.anyOf]: { [val]: [defaultRule] },
      [criterias.condition]: { [val]: [defaultRule] },
    };

    const newCondition = nestedConditionMap[val] || { [val]: [defaultRule] };

    if (criteria === criterias.not) {
      updateRules(newCondition);
    } else {
      const updatedNestedConditionRow = nestedConditionRow.map((c, index) => {
        if (index === nestedConditionIndex) {
          return newCondition;
        }
        return c;
      });
      updateRules(updatedNestedConditionRow);
    }
  };

  const handleAddNestedCondition = (currentCriteria: string) => {
    const newNestedCondition = {
      [criterias.allOf]: [getDefaultRule(selPluginResourceType)],
    };
    const updatedNestedConditionRow = [
      ...nestedConditionRow,
      newNestedCondition,
    ];
    updateRules(
      currentCriteria === criterias.not
        ? newNestedCondition
        : updatedNestedConditionRow,
    );
  };

  const handleNotConditionTypeChange = (val: string) => {
    setNotConditionType(val as NotConditionType);
    if (val === 'nested-condition') {
      handleAddNestedCondition(criterias.not);
      handleSetErrors([], criteria, criterias.not, 0, 0, true);
    } else {
      onRuleChange({
        not: getDefaultRule(selPluginResourceType),
      });
      handleSetErrors([], criteria, criterias.not, 0, 0, true);
      handleSetErrors([], criteria, undefined, undefined, undefined, true);
    }
  };

  const handleAddRuleInNestedCondition = (
    nestedConditionCriteria: string,
    nestedConditionIndex: number,
  ) => {
    const updatedNestedConditionRow: Condition[] = [];

    nestedConditionRow.forEach((c, index) => {
      if (index === nestedConditionIndex) {
        updatedNestedConditionRow.push({
          [nestedConditionCriteria as keyof Condition]: [
            ...((c[
              nestedConditionCriteria as keyof Condition
            ] as PermissionCondition[]) || []),
            getDefaultRule(selPluginResourceType),
          ],
        });
      } else {
        updatedNestedConditionRow.push(c);
      }
    });
    updateRules(
      criteria === criterias.not
        ? updatedNestedConditionRow[0]
        : updatedNestedConditionRow,
    );
  };

  const handleRemoveNestedCondition = (
    nestedConditionCriteria: string,
    nestedConditionIndex: number,
  ) => {
    const updatedNestedConditionRow = nestedConditionRow.filter(
      (_, index) => index !== nestedConditionIndex,
    );

    updateRules(updatedNestedConditionRow);
    handleSetErrors(
      [],
      criteria,
      nestedConditionCriteria,
      nestedConditionIndex,
      undefined,
      true,
    );
  };

  const handleRemoveNestedConditionRule = (
    nestedConditionCriteria: string,
    nestedConditionIndex: number,
    ruleIndex: number,
  ) => {
    const updatedNestedConditionRow: Condition[] = [];

    nestedConditionRow.forEach((c, index) => {
      if (index === nestedConditionIndex) {
        const updatedRules = (
          (c[
            nestedConditionCriteria as keyof Condition
          ] as PermissionCondition[]) || []
        ).filter((_r, rindex) => rindex !== ruleIndex);
        updatedNestedConditionRow.push({
          [nestedConditionCriteria as keyof Condition]: updatedRules,
        });
      } else {
        updatedNestedConditionRow.push(c);
      }
    });

    updateRules(
      criteria === criterias.not
        ? updatedNestedConditionRow[0]
        : updatedNestedConditionRow,
    );

    handleSetErrors(
      [],
      criteria,
      nestedConditionCriteria,
      nestedConditionIndex,
      ruleIndex,
      true,
    );
  };

  const renderConditionRule = () => {
    return (
      <ConditionsFormRowFields
        oldCondition={
          conditionRow.condition ?? getDefaultRule(selPluginResourceType)
        }
        onRuleChange={onRuleChange}
        conditionRow={conditionRow}
        criteria={criteria}
        conditionRulesData={conditionRulesData}
        handleSetErrors={handleSetErrors}
        optionDisabled={ruleOption =>
          ruleOptionDisabled(
            ruleOption,
            conditionRow.condition ? [conditionRow.condition] : undefined,
          )
        }
        setRemoveAllClicked={setRemoveAllClicked}
      />
    );
  };

  const renderComplexConditionRow = (
    c: Condition,
    index: number,
    activeCriteria?: 'allOf' | 'anyOf',
    isNestedCondition = false,
    nestedConditionIndex?: number,
    activeNestedCriteria?: 'allOf' | 'anyOf',
  ) => {
    const rowStyle = isNestedCondition
      ? {
          display:
            (c as PermissionCondition).rule !== undefined ? 'flex' : 'none',
        }
      : { display: 'flex', gap: '10px' };
    const rowKey = isNestedCondition
      ? `nestedCondition-rule-${index}`
      : `condition-rule-${index}`;
    const rs =
      (c[activeCriteria as keyof Condition] as PermissionCondition[]) ?? [];
    return (
      (c as PermissionCondition).resourceType && (
        <div style={rowStyle} key={rowKey}>
          <ConditionsFormRowFields
            oldCondition={c}
            index={isNestedCondition ? undefined : index}
            onRuleChange={onRuleChange}
            conditionRow={conditionRow}
            criteria={criteria}
            conditionRulesData={conditionRulesData}
            handleSetErrors={handleSetErrors}
            setRemoveAllClicked={setRemoveAllClicked}
            nestedConditionRow={
              isNestedCondition ? nestedConditionRow : undefined
            }
            nestedConditionCriteria={
              isNestedCondition ? activeNestedCriteria : undefined
            }
            nestedConditionIndex={
              isNestedCondition ? nestedConditionIndex : undefined
            }
            ruleIndex={isNestedCondition ? index : undefined}
            updateRules={isNestedCondition ? updateRules : undefined}
          />
          <IconButton
            title="Remove"
            className={classes.removeRuleButton}
            disabled={index === 0}
            onClick={
              isNestedCondition
                ? () =>
                    handleRemoveNestedConditionRule(
                      activeNestedCriteria as 'allOf' | 'anyOf',
                      nestedConditionIndex as number,
                      index,
                    )
                : () => {
                    const rules = rs.filter((_r, rindex) => index !== rindex);
                    onRuleChange({
                      [activeCriteria as keyof Condition]: rules,
                    });
                    handleSetErrors(
                      [],
                      criteria,
                      undefined,
                      undefined,
                      index,
                      true,
                    );
                  }
            }
          >
            <RemoveIcon />
          </IconButton>
        </div>
      )
    );
  };

  const renderComplexConditionRowButtons = () =>
    (criteria === criterias.allOf || criteria === criterias.anyOf) && (
      <Box mt={1} mb={1}>
        <Button
          className={classes.addRuleButton}
          size="small"
          onClick={() =>
            onRuleChange({
              [criteria]: [
                ...(conditionRow.allOf ?? []),
                ...(conditionRow.anyOf ?? []),
                getDefaultRule(selPluginResourceType),
              ],
            })
          }
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
    );

  const renderNestedConditionRow = (
    nc: Condition,
    nestedConditionIndex: number,
  ) => {
    const selectedNestedConditionCriteria = Object.keys(nc)[0];
    return (
      <Box
        mt={2}
        className={classes.nestedConditionRow}
        key={`nestedCondition-${nestedConditionIndex}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ToggleButtonGroup
            exclusive
            value={selectedNestedConditionCriteria}
            onChange={(_event, newNestedCriteria) =>
              handleNestedConditionCriteriaChange(
                newNestedCriteria,
                nestedConditionIndex,
              )
            }
            className={classes.nestedConditioncriteriaButtonGroup}
          >
            {nestedConditionButtons.map(({ val, label }) => (
              <CriteriaToggleButton
                val={val}
                label={label}
                selectedCriteria={selectedNestedConditionCriteria}
                theme={theme}
              />
            ))}
          </ToggleButtonGroup>
          {criteria !== criterias.not && (
            <IconButton
              title="Remove nested condition"
              className={classes.removeNestedRuleButton}
              onClick={() =>
                handleRemoveNestedCondition(
                  selectedNestedConditionCriteria,
                  nestedConditionIndex,
                )
              }
            >
              <RemoveIcon />
            </IconButton>
          )}
        </div>
        <Box>
          {selectedNestedConditionCriteria !== criterias.not &&
            (
              nc[
                selectedNestedConditionCriteria as keyof Condition
              ] as PermissionCondition[]
            ).map((c, index) =>
              renderComplexConditionRow(
                c,
                index,
                undefined,
                true,
                nestedConditionIndex,
                selectedNestedConditionCriteria as 'allOf' | 'anyOf',
              ),
            )}
          {selectedNestedConditionCriteria === criterias.not && (
            <ConditionsFormRowFields
              oldCondition={
                (nc as ConditionsData).not ??
                getDefaultRule(selPluginResourceType)
              }
              onRuleChange={onRuleChange}
              conditionRow={nc}
              criteria={criteria}
              conditionRulesData={conditionRulesData}
              handleSetErrors={handleSetErrors}
              optionDisabled={ruleOption =>
                ruleOptionDisabled(
                  ruleOption,
                  (nc as ConditionsData).not
                    ? [(nc as ConditionsData).not as PermissionCondition]
                    : undefined,
                )
              }
              setRemoveAllClicked={setRemoveAllClicked}
              nestedConditionRow={nestedConditionRow}
              nestedConditionCriteria={selectedNestedConditionCriteria}
              nestedConditionIndex={nestedConditionIndex}
              updateRules={updateRules}
            />
          )}
          {selectedNestedConditionCriteria !== criterias.not && (
            <Button
              className={classes.addRuleButton}
              size="small"
              onClick={() =>
                handleAddRuleInNestedCondition(
                  selectedNestedConditionCriteria,
                  nestedConditionIndex,
                )
              }
            >
              <AddIcon fontSize="small" />
              Add rule
            </Button>
          )}
        </Box>
      </Box>
    );
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
          <CriteriaToggleButton
            val={val}
            label={label}
            selectedCriteria={criteria}
            theme={theme}
          />
        ))}
      </ToggleButtonGroup>
      {criteria === criterias.condition && renderConditionRule()}
      {criteria !== criterias.condition && (
        <Box>
          {criteria !== criterias.not &&
            (
              conditionRow[
                criteria as keyof ConditionsData
              ] as PermissionCondition[]
            )?.map((c, index) =>
              renderComplexConditionRow(
                c,
                index,
                criteria as 'allOf' | 'anyOf',
              ),
            )}
          {criteria === criterias.not && (
            <RadioGroup
              className={classes.radioGroup}
              value={notConditionType}
              onChange={(_event, value) =>
                handleNotConditionTypeChange(value as NotConditionType)
              }
            >
              <FormControlLabel
                value="simple-condition"
                control={<Radio color="primary" />}
                label="Add rule"
                className={classes.radioLabel}
              />
              {notConditionType === 'simple-condition' && (
                <ConditionsFormRowFields
                  oldCondition={
                    conditionRow.not ?? getDefaultRule(selPluginResourceType)
                  }
                  onRuleChange={onRuleChange}
                  conditionRow={conditionRow}
                  criteria={criteria}
                  conditionRulesData={conditionRulesData}
                  handleSetErrors={handleSetErrors}
                  optionDisabled={ruleOption =>
                    ruleOptionDisabled(
                      ruleOption,
                      conditionRow.not
                        ? [conditionRow.not as PermissionCondition]
                        : undefined,
                    )
                  }
                  setRemoveAllClicked={setRemoveAllClicked}
                />
              )}
              <FormControlLabel
                value="nested-condition"
                control={<Radio color="primary" />}
                label={<AddNestedConditionButton />}
                className={classes.radioLabel}
              />
            </RadioGroup>
          )}
          {renderComplexConditionRowButtons()}
          {nestedConditionRow?.length > 0 &&
            nestedConditionRow.map((nc, nestedConditionIndex) =>
              renderNestedConditionRow(nc, nestedConditionIndex),
            )}
        </Box>
      )}
    </Box>
  );
};
