import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import {
  FormControlLabel,
  IconButton,
  makeStyles,
  Radio,
  RadioGroup,
  Tooltip,
  useTheme,
} from '@material-ui/core';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { RJSFValidationError } from '@rjsf/utils';

import { ConditionsFormRowFields } from './ConditionsFormRowFields';
import { conditionButtons, criterias } from './const';
import { Condition, ConditionsData, RulesData } from './types';

const useStyles = makeStyles(theme => ({
  conditionRow: {
    padding: '20px',
    border: `1px solid ${theme.palette.border}`,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    '& input': {
      backgroundColor: `${theme.palette.background.paper}!important`,
    },
  },
  nestedConditionRow: {
    padding: '20px',
    marginLeft: '1.5rem',
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
  nestedConditioncriteriaButtonGroup: {
    backgroundColor: theme.palette.background.paper,
    width: '60%',
    height: '100%',
  },
  criteriaButton: {
    width: '100%',
    textTransform: 'none',
    padding: theme.spacing(1),
  },
  addRuleButton: {
    display: 'flex',
    color: theme.palette.primary.light,
    textTransform: 'none',
    marginTop: theme.spacing(2),
  },
  addNestedConditionButton: {
    display: 'flex',
    color: theme.palette.primary.light,
    textTransform: 'none',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  addNestedConditionLabel: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    margin: '0.5rem',
  },
  radioLabel: {
    marginTop: '0.5rem',
  },
}));

type ConditionFormRowProps = {
  conditionRulesData?: RulesData;
  conditionRow: ConditionsData;
  onRuleChange: (newCondition: ConditionsData) => void;
  selPluginResourceType: string;
  criteria: string;
  setCriteria: React.Dispatch<React.SetStateAction<string>>;
  handleSetErrors: (
    newErrors: RJSFValidationError[],
    criteria: string,
    nestedCriteria?: string,
    nestedConditionIndex?: number,
    ruleIndex?: number,
    removeErrors?: boolean,
  ) => void;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

type NotConditionType = 'simple-condition' | 'nested-condition';

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
  const classes = useStyles();
  const theme = useTheme();
  const nestedConditionButtons = conditionButtons.filter(
    button => button.val !== 'condition',
  );

  const [nestedConditionRow, setNestedConditionRow] = React.useState<
    ConditionsData[]
  >([]);
  const [notConditionType, setNotConditionType] =
    React.useState<NotConditionType>('simple-condition');

  const extractNestedConditions = (
    conditions: ConditionsData[],
    criteriaTypes: string[],
    nestedConditions: ConditionsData[],
  ) => {
    conditions.forEach(c => {
      criteriaTypes.forEach(ct => {
        if (Object.keys(c).includes(ct)) {
          nestedConditions.push(c);
        }
      });
    });
  };

  React.useEffect(() => {
    const nestedConditions: ConditionsData[] = [];
    const criteriaTypes = [criterias.allOf, criterias.anyOf, criterias.not];
    switch (criteria) {
      case criterias.allOf:
        extractNestedConditions(
          (conditionRow.allOf as ConditionsData[]) || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.anyOf:
        extractNestedConditions(
          (conditionRow.anyOf as ConditionsData[]) || [],
          criteriaTypes,
          nestedConditions,
        );
        break;
      case criterias.not:
        if (
          criteriaTypes.includes(
            Object.keys(conditionRow.not as ConditionsData)[0],
          )
        ) {
          nestedConditions.push(conditionRow.not as ConditionsData);
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
        setNotConditionType('simple-condition');
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

  const updateRules = (
    updatedNestedConditionRow: ConditionsData[] | ConditionsData,
  ) => {
    const existingSimpleCondition =
      criteria !== criterias.not
        ? (
            conditionRow[criteria as keyof ConditionsData] as Condition[]
          )?.filter(con => Object.keys(con).includes('rule')) || []
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
        not: updatedNestedConditionRow as ConditionsData,
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
    const newNestedConditionNot: ConditionsData = {
      [val]: {
        rule: '',
        resourceType: selPluginResourceType,
        params: {},
      },
    };
    const newNestedConditionAllOfOrAnyOf: ConditionsData = {
      [val]: [
        {
          rule: '',
          resourceType: selPluginResourceType,
          params: {},
        },
      ],
    };
    if (criteria === criterias.not) {
      updateRules(
        val === criterias.not
          ? newNestedConditionNot
          : newNestedConditionAllOfOrAnyOf,
      );
    } else {
      const updatedNestedConditionRow = nestedConditionRow.map((c, index) => {
        if (index === nestedConditionIndex) {
          return val === criterias.not
            ? newNestedConditionNot
            : newNestedConditionAllOfOrAnyOf;
        }
        return c;
      });
      updateRules(updatedNestedConditionRow);
    }
  };

  const handleAddNestedCondition = (currentCriteria: string) => {
    const newNestedCondition = {
      [criterias.allOf]: [
        {
          rule: '',
          resourceType: selPluginResourceType,
          params: {},
        },
      ],
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
        not: {
          rule: '',
          resourceType: selPluginResourceType,
          params: {},
        },
      });
      handleSetErrors([], criteria, criterias.not, 0, 0, true);
      handleSetErrors([], criteria, undefined, undefined, undefined, true);
    }
  };

  const handleAddRuleInNestedCondition = (
    nestedConditionCriteria: string,
    nestedConditionIndex: number,
  ) => {
    const updatedNestedConditionRow: ConditionsData[] = [];

    nestedConditionRow.forEach((c, index) => {
      if (index === nestedConditionIndex) {
        updatedNestedConditionRow.push({
          [nestedConditionCriteria as keyof ConditionsData]: [
            ...((c[
              nestedConditionCriteria as keyof ConditionsData
            ] as PermissionCondition[]) || []),
            {
              rule: '',
              resourceType: selPluginResourceType,
              params: {},
            },
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
    const updatedNestedConditionRow: ConditionsData[] = [];

    nestedConditionRow.forEach((c, index) => {
      if (index === nestedConditionIndex) {
        const updatedRules = (
          (c[
            nestedConditionCriteria as keyof ConditionsData
          ] as PermissionCondition[]) || []
        ).filter((_r, rindex) => rindex !== ruleIndex);
        updatedNestedConditionRow.push({
          [nestedConditionCriteria as keyof ConditionsData]: updatedRules,
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

  const ruleOptionDisabled = (
    ruleOption: string,
    conditions?: PermissionCondition[],
  ) => {
    return !!(conditions || []).find(con => con.rule === ruleOption);
  };

  const renderConditionRule = () => {
    return (
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

  const addNestedConditionLabel = () => {
    const tooltipTitle = () => (
      <div>
        <p style={{ textAlign: 'center' }}>
          Nested conditions are <b>1 layer rules within a main condition</b>. It
          lets you allow appropriate access by using detailed permissions based
          on various conditions. You can add multiple nested conditions.
        </p>
        <p style={{ textAlign: 'center' }}>
          For example, you can allow access to all entity types in the main
          condition and use a nested condition to limit the access to entities
          owned by the user.
        </p>
      </div>
    );
    return (
      <Box className={classes.addNestedConditionLabel}>
        <span>Add Nested Condition</span>
        <Tooltip title={tooltipTitle()} placement="top">
          <HelpOutlineIcon
            fontSize="inherit"
            style={{ marginLeft: '0.25rem' }}
          />
        </Tooltip>
      </Box>
    );
  };
  let showMultilevelNestedConditionWarning = false;
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
            size="large"
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {(criteria === criterias.allOf ||
        criteria === criterias.anyOf ||
        criteria === criterias.not) && (
        <Box>
          {criteria === criterias.allOf &&
            conditionRow.allOf?.map(
              (c, index) =>
                (c as PermissionCondition).resourceType && (
                  <div
                    style={{ display: 'flex', gap: '10px' }}
                    key={`condition-${index}`}
                  >
                    <ConditionsFormRowFields
                      oldCondition={c}
                      index={index}
                      onRuleChange={onRuleChange}
                      conditionRow={conditionRow}
                      criteria={criteria}
                      conditionRulesData={conditionRulesData}
                      handleSetErrors={handleSetErrors}
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
                        handleSetErrors(
                          [],
                          criteria,
                          undefined,
                          undefined,
                          index,
                          true,
                        );
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </div>
                ),
            )}
          {criteria === criterias.anyOf &&
            conditionRow.anyOf?.map((c, index) => {
              return (
                (c as PermissionCondition).resourceType && (
                  <div style={{ display: 'flex' }} key={`condition-${index}`}>
                    <ConditionsFormRowFields
                      oldCondition={c}
                      index={index}
                      onRuleChange={onRuleChange}
                      conditionRow={conditionRow}
                      criteria={criteria}
                      conditionRulesData={conditionRulesData}
                      handleSetErrors={handleSetErrors}
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
                        handleSetErrors(
                          [],
                          criteria,
                          undefined,
                          undefined,
                          index,
                          true,
                        );
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </div>
                )
              );
            })}
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
                label={addNestedConditionLabel()}
                className={classes.radioLabel}
              />
            </RadioGroup>
          )}
          {(criteria === criterias.allOf || criteria === criterias.anyOf) && (
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
          )}
          {(criteria === criterias.allOf || criteria === criterias.anyOf) && (
            <Button
              className={classes.addNestedConditionButton}
              size="small"
              onClick={() => handleAddNestedCondition(criteria)}
            >
              <AddIcon fontSize="small" />
              {addNestedConditionLabel()}
            </Button>
          )}
          {nestedConditionRow?.length > 0 &&
            nestedConditionRow.map((nc, nestedConditionIndex) => (
              <Box
                mt={1}
                className={classes.nestedConditionRow}
                key={`nestedCondition-${nestedConditionIndex}`}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <ToggleButtonGroup
                    exclusive
                    value={Object.keys(nc)[0]}
                    onChange={(_event, newNestedCriteria) =>
                      handleNestedConditionCriteriaChange(
                        newNestedCriteria,
                        nestedConditionIndex,
                      )
                    }
                    className={classes.nestedConditioncriteriaButtonGroup}
                  >
                    {nestedConditionButtons.map(({ val, label }) => (
                      <ToggleButton
                        key={val}
                        value={val}
                        style={
                          val === Object.keys(nc)[0]
                            ? {
                                color: theme.palette.infoText,
                                backgroundColor: theme.palette.infoBackground,
                              }
                            : {}
                        }
                        className={classes.criteriaButton}
                        size="large"
                      >
                        {label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  {criteria !== criterias.not && (
                    <IconButton
                      title="Remove"
                      className={classes.removeNestedRuleButton}
                      onClick={() =>
                        handleRemoveNestedCondition(
                          Object.keys(nc)[0],
                          nestedConditionIndex,
                        )
                      }
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </div>
                <Box>
                  {Object.keys(nc)[0] === criterias.allOf &&
                    nc.allOf?.map((c, index) => {
                      if ((c as PermissionCondition).rule === undefined) {
                        showMultilevelNestedConditionWarning = true;
                      }
                      return (
                        (c as PermissionCondition).rule !== undefined && (
                          <div
                            style={{
                              display:
                                (c as PermissionCondition).rule !== undefined
                                  ? 'flex'
                                  : 'none',
                            }}
                            key={`condition-${index}`}
                          >
                            <ConditionsFormRowFields
                              oldCondition={c}
                              index={index}
                              onRuleChange={onRuleChange}
                              conditionRow={conditionRow}
                              criteria={criteria}
                              conditionRulesData={conditionRulesData}
                              handleSetErrors={handleSetErrors}
                              setRemoveAllClicked={setRemoveAllClicked}
                              nestedConditionRow={nestedConditionRow}
                              nestedConditionCriteria={Object.keys(nc)[0]}
                              nestedConditionIndex={nestedConditionIndex}
                              ruleIndex={index}
                              updateRules={updateRules}
                            />
                            <IconButton
                              title="Remove"
                              className={classes.removeRuleButton}
                              disabled={index === 0}
                              onClick={() =>
                                handleRemoveNestedConditionRule(
                                  criterias.allOf,
                                  nestedConditionIndex,
                                  index,
                                )
                              }
                            >
                              <RemoveIcon />
                            </IconButton>
                          </div>
                        )
                      );
                    })}
                  {Object.keys(nc)[0] === criterias.anyOf &&
                    nc.anyOf?.map((c, index) => {
                      if ((c as PermissionCondition).rule === undefined) {
                        showMultilevelNestedConditionWarning = true;
                      }
                      return (
                        <div
                          style={{
                            display:
                              (c as PermissionCondition).rule !== undefined
                                ? 'flex'
                                : 'none',
                          }}
                          key={`condition-${index}`}
                        >
                          <ConditionsFormRowFields
                            oldCondition={c}
                            index={index}
                            onRuleChange={onRuleChange}
                            conditionRow={conditionRow}
                            criteria={criteria}
                            conditionRulesData={conditionRulesData}
                            handleSetErrors={handleSetErrors}
                            setRemoveAllClicked={setRemoveAllClicked}
                            nestedConditionRow={nestedConditionRow}
                            nestedConditionCriteria={Object.keys(nc)[0]}
                            nestedConditionIndex={nestedConditionIndex}
                            ruleIndex={index}
                            updateRules={updateRules}
                          />
                          <IconButton
                            title="Remove"
                            className={classes.removeRuleButton}
                            disabled={index === 0}
                            onClick={() =>
                              handleRemoveNestedConditionRule(
                                criterias.anyOf,
                                nestedConditionIndex,
                                index,
                              )
                            }
                          >
                            <RemoveIcon />
                          </IconButton>
                        </div>
                      );
                    })}
                  {Object.keys(nc)[0] === criterias.not && (
                    <ConditionsFormRowFields
                      oldCondition={
                        nc.not ?? {
                          rule: '',
                          resourceType: selPluginResourceType,
                          params: {},
                        }
                      }
                      onRuleChange={onRuleChange}
                      conditionRow={nc}
                      criteria={criteria}
                      conditionRulesData={conditionRulesData}
                      handleSetErrors={handleSetErrors}
                      optionDisabled={ruleOption =>
                        ruleOptionDisabled(
                          ruleOption,
                          nc.not ? [nc.not as PermissionCondition] : undefined,
                        )
                      }
                      setRemoveAllClicked={setRemoveAllClicked}
                      nestedConditionRow={nestedConditionRow}
                      nestedConditionCriteria={Object.keys(nc)[0]}
                      nestedConditionIndex={nestedConditionIndex}
                      updateRules={updateRules}
                    />
                  )}
                  {showMultilevelNestedConditionWarning && (
                    <div style={{ width: '90%', marginTop: '2rem' }}>
                      This condition contains multiple nested levels that the UI
                      does not yet support. Please use the CLI to view
                      additional levels of nested conditions.
                    </div>
                  )}
                  {Object.keys(nc)[0] !== criterias.not && (
                    <Button
                      className={classes.addRuleButton}
                      size="small"
                      onClick={() =>
                        handleAddRuleInNestedCondition(
                          Object.keys(nc)[0],
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
            ))}
        </Box>
      )}
      {criteria === criterias.condition && renderConditionRule()}
    </Box>
  );
};
