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
import { RJSFValidationError } from '@rjsf/utils';

import {
  calculateConditionIndex,
  extractNestedConditions,
  getDefaultRule,
  initializeErrors,
  isNestedConditionRule,
  nestedConditionButtons,
  ruleOptionDisabled,
  useConditionsFormRowStyles,
} from '../../utils/conditional-access-utils';
import { AddNestedConditionButton } from './AddNestedConditionButton';
import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { conditionButtons, criterias } from './const';
import { CriteriaToggleButton } from './CriteriaToggleButton';
import {
  ComplexErrors,
  Condition,
  ConditionFormRowProps,
  ConditionsData,
  NestedCriteriaErrors,
  NotConditionType,
} from './types';

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
          conditionRow.allOf || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.anyOf:
        extractNestedConditions(
          conditionRow.anyOf || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.not:
        if (
          conditionRow.not &&
          criteriaTypes.includes(Object.keys(conditionRow.not)[0])
        ) {
          nestedConditions.push(conditionRow.not);
          setNotConditionType('nested-condition');
        }
        break;
      default:
        break;
    }

    setNestedConditionRow(nestedConditions);
  }, [conditionRow, criteria]);

  const handleCriteriaChange = (val: string) => {
    setCriteria(val);
    setErrors(initializeErrors(val));

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
    } else if (
      criteria === criterias.not &&
      !Array.isArray(updatedNestedConditionRow)
    ) {
      onRuleChange({
        not: updatedNestedConditionRow,
      });
    }
  };

  const handleNestedConditionCriteriaChange = (
    val: string,
    nestedConditionIndex: number,
  ) => {
    const defaultRule = getDefaultRule(selPluginResourceType);

    const nestedConditionMap = {
      [criterias.not]: { [val]: defaultRule },
      [criterias.allOf]: { [val]: [defaultRule] },
      [criterias.anyOf]: { [val]: [defaultRule] },
      [criterias.condition]: { [val]: [defaultRule] },
    };

    const newCondition = nestedConditionMap[val] || { [val]: [defaultRule] };

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[criteria] !== undefined) {
        if (criteria === criterias.not) {
          (updatedErrors[criteria] as ComplexErrors) =
            val !== criterias.not ? { [val]: [''] } : { [val]: '' };
          return updatedErrors;
        }
        const criteriaErrors = updatedErrors[criteria];
        const simpleRuleErrors = (criteriaErrors as ComplexErrors[]).filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = (
          criteriaErrors as ComplexErrors[]
        ).filter((err: ComplexErrors) => typeof err !== 'string');
        nestedConditionErrors[nestedConditionIndex] =
          val !== criterias.not ? { [val]: [''] } : { [val]: '' };
        updatedErrors[criteria] = [
          ...simpleRuleErrors,
          ...nestedConditionErrors,
        ];
      }

      return updatedErrors;
    });

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

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors[currentCriteria]) {
        const criteriaErrors = updatedErrors[
          currentCriteria
        ] as ComplexErrors[];
        if (Array.isArray(criteriaErrors)) {
          criteriaErrors.push({ [criterias.allOf]: [''] });
        } else {
          (updatedErrors[currentCriteria] as ComplexErrors) = {
            [criterias.allOf]: [''],
          };
        }
      }
      return updatedErrors;
    });
  };

  const handleNotConditionTypeChange = (val: NotConditionType) => {
    setNotConditionType(val);
    setErrors(initializeErrors(criteria, val));
    if (val === 'nested-condition') {
      handleAddNestedCondition(criterias.not);
    } else {
      onRuleChange({
        not: getDefaultRule(selPluginResourceType),
      });
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

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      if (updatedErrors[criteria] !== undefined) {
        const criteriaErrors = updatedErrors[criteria];
        if (
          criteria === criterias.not &&
          notConditionType === 'nested-condition'
        ) {
          (
            (criteriaErrors as NestedCriteriaErrors)[
              nestedConditionCriteria
            ] as string[]
          ).push('');
          return updatedErrors;
        }
        const simpleRuleErrors = (criteriaErrors as ComplexErrors[]).filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = (
          criteriaErrors as ComplexErrors[]
        ).filter((err: ComplexErrors) => typeof err !== 'string');

        (
          (nestedConditionErrors[nestedConditionIndex] as NestedCriteriaErrors)[
            nestedConditionCriteria
          ] as (RJSFValidationError | {})[]
        ).push('');
        updatedErrors[criteria] = [
          ...simpleRuleErrors,
          ...nestedConditionErrors,
        ];
      }
      return updatedErrors;
    });
  };

  const handleRemoveSimpleConditionRule = (
    activeCriteria: string,
    index: number,
    rs: PermissionCondition[],
  ) => {
    const updatedSimpleRules = rs.filter((_r, rindex) => index !== rindex);
    const nestedConditions =
      (
        conditionRow[criteria as keyof ConditionsData] as PermissionCondition[]
      )?.filter(
        (con: PermissionCondition) =>
          criterias.allOf in con ||
          criterias.anyOf in con ||
          criterias.not in con,
      ) || [];

    onRuleChange({
      [activeCriteria as keyof Condition]: [
        ...updatedSimpleRules,
        ...nestedConditions,
      ],
    });

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[activeCriteria]) {
        const criteriaErrors = updatedErrors[activeCriteria] as ComplexErrors[];
        const simpleRuleErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err !== 'string',
        );

        if (Array.isArray(simpleRuleErrors) && simpleRuleErrors.length > 0) {
          const updatedCriteriaErrors = [
            ...simpleRuleErrors.filter((_, rindex) => rindex !== index),
            ...nestedConditionErrors,
          ];

          updatedErrors[activeCriteria] =
            updatedCriteriaErrors.length > 0 ? updatedCriteriaErrors : [];
        } else {
          delete updatedErrors[activeCriteria];
        }
      }

      return updatedErrors;
    });
  };

  const handleRemoveNestedCondition = (nestedConditionIndex: number) => {
    const updatedNestedConditionRow = nestedConditionRow.filter(
      (_, index) => index !== nestedConditionIndex,
    );

    updateRules(updatedNestedConditionRow);
    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[criteria] !== undefined) {
        const criteriaErrors = updatedErrors[criteria] as ComplexErrors[];
        const simpleRuleErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err !== 'string',
        );
        nestedConditionErrors.splice(nestedConditionIndex, 1);

        updatedErrors[criteria] = [
          ...simpleRuleErrors,
          ...nestedConditionErrors,
        ];
      }

      return updatedErrors;
    });
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

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };

      if (updatedErrors[criteria] !== undefined) {
        const criteriaErrors = updatedErrors[criteria] as ComplexErrors[];

        if (
          criteria === criterias.not &&
          notConditionType === 'nested-condition'
        ) {
          (
            (updatedErrors[criteria] as NestedCriteriaErrors)[
              nestedConditionCriteria
            ] as string[]
          ).splice(ruleIndex, 1);
          return updatedErrors;
        }

        const simpleRuleErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err === 'string',
        );
        const nestedConditionErrors = criteriaErrors.filter(
          (err: ComplexErrors) => typeof err !== 'string',
        );

        if (Array.isArray(nestedConditionErrors)) {
          const nestedErrors = nestedConditionErrors[
            nestedConditionIndex
          ] as NestedCriteriaErrors;

          if (nestedErrors?.nestedConditionCriteria) {
            const updatedNestedErrors = (
              nestedErrors[nestedConditionCriteria] as string[]
            ).filter((_error, index) => index !== ruleIndex);

            if (updatedNestedErrors.length > 0) {
              nestedErrors[nestedConditionCriteria] = updatedNestedErrors;
            } else {
              delete nestedErrors[nestedConditionCriteria];
            }

            nestedConditionErrors[nestedConditionIndex] = nestedErrors;
          }

          updatedErrors[criteria] = [
            ...simpleRuleErrors,
            ...nestedConditionErrors,
          ];
        }
      }

      return updatedErrors;
    });
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
        setErrors={setErrors}
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
    ruleIndex: number,
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
      ? `nestedCondition-rule-${ruleIndex}`
      : `condition-rule-${ruleIndex}`;
    const rs = isNestedCondition
      ? (c[activeCriteria as keyof Condition] as PermissionCondition[])
      : ((
          conditionRow[activeCriteria as keyof Condition] as Condition[]
        ).filter(r =>
          Object.keys(r).includes('rule'),
        ) as PermissionCondition[]);
    const disabled =
      !isNestedCondition &&
      (conditionRow[criteria as keyof Condition] as Condition[]).length === 1 &&
      nestedConditionRow.length === 0 &&
      ruleIndex === 0;
    const nestedDisabled =
      isNestedCondition &&
      (
        nestedConditionRow[nestedConditionIndex ?? 0][
          activeNestedCriteria as keyof Condition
        ] as Condition[]
      ).length === 1 &&
      ruleIndex === 0;
    return (
      (c as PermissionCondition).resourceType && (
        <div style={rowStyle} key={rowKey}>
          <ConditionsFormRowFields
            oldCondition={c}
            index={isNestedCondition ? undefined : ruleIndex}
            onRuleChange={onRuleChange}
            conditionRow={conditionRow}
            criteria={criteria}
            conditionRulesData={conditionRulesData}
            setErrors={setErrors}
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
            nestedConditionRuleIndex={isNestedCondition ? ruleIndex : undefined}
            updateRules={isNestedCondition ? updateRules : undefined}
          />
          <IconButton
            title="Remove"
            className={classes.removeRuleButton}
            disabled={isNestedCondition ? nestedDisabled : disabled}
            onClick={
              isNestedCondition &&
              activeNestedCriteria &&
              nestedConditionIndex !== undefined
                ? () =>
                    handleRemoveNestedConditionRule(
                      activeNestedCriteria,
                      nestedConditionIndex,
                      ruleIndex,
                    )
                : () => {
                    handleRemoveSimpleConditionRule(
                      activeCriteria as string,
                      ruleIndex,
                      rs,
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
          onClick={() => {
            const updatedRules = [
              ...(conditionRow.allOf ?? []),
              ...(conditionRow.anyOf ?? []),
            ];
            const firstNestedConditionIndex =
              updatedRules.findIndex(e => isNestedConditionRule(e)) || 0;
            updatedRules.splice(
              firstNestedConditionIndex,
              0,
              getDefaultRule(selPluginResourceType),
            );
            onRuleChange({
              [criteria]: [...updatedRules],
            });
            setErrors(prevErrors => {
              const updatedErrors = { ...prevErrors };
              const firstNestedConditionErrorIndex =
                (updatedErrors[criteria] as string[]).findIndex(
                  e => typeof e !== 'string',
                ) || 0;
              (updatedErrors[criteria] as string[]).splice(
                firstNestedConditionErrorIndex,
                0,
                '',
              );
              return updatedErrors;
            });
          }}
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
    const simpleRulesCount = calculateConditionIndex(
      conditionRow,
      nestedConditionIndex,
      criteria,
    );
    const nestedConditionsCount = nestedConditionRow.length;
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
                key={`nested-criteria-${val}`}
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
              disabled={simpleRulesCount === 0 && nestedConditionsCount === 1} // 0 simple rules and this is the only 1 nested condition
              onClick={() => handleRemoveNestedCondition(nestedConditionIndex)}
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
            ).map((c, ncrIndex) =>
              renderComplexConditionRow(
                c,
                ncrIndex,
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
              conditionRow={conditionRow}
              criteria={criteria}
              conditionRulesData={conditionRulesData}
              setErrors={setErrors}
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
            key={`criteria-${val}`}
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
            )?.map((c, srIndex) =>
              renderComplexConditionRow(
                c,
                srIndex,
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
                  setErrors={setErrors}
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
