import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import { Box, makeStyles, TextField, Theme } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Form from '@rjsf/mui';
import {
  RegistryFieldsType,
  RJSFSchema,
  RJSFValidationError,
  UiSchema,
} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { criterias } from './const';
import { CustomArrayField } from './CustomArrayField';
import { RulesDropdownOption } from './RulesDropdownOption';
import { Condition, ConditionsData, RulesData } from './types';

interface StyleProps {
  isNotSimpleCondition: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>(theme => ({
  bgPaper: {
    backgroundColor: theme.palette.background.paper,
  },
  params: {
    fontFamily: theme.typography.fontFamily,
  },
  inputFieldContainer: {
    display: 'flex',
    flexFlow: 'row',
    gap: '10px',
    flexGrow: 1,
    margin: ({ isNotSimpleCondition }) =>
      isNotSimpleCondition ? '-1.5rem 0 0 1.85rem' : '0',
  },
  ruleKeyInput: {
    marginTop: '26px',
    width: '50%',
  },
  ruleValueInput: {
    backgroundColor: theme.palette.background.paper,
    marginTop: '26px',
    width: '100%',
  },
}));

type ConditionFormRowFieldsProps = {
  oldCondition: Condition;
  index?: number;
  criteria: string;
  onRuleChange: (newCondition: ConditionsData) => void;
  conditionRow: ConditionsData;
  conditionRulesData?: RulesData;
  handleSetErrors: (
    newErrors: RJSFValidationError[],
    criteria: string,
    nestedCriteria?: string,
    nestedConditionIndex?: number,
    ruleIndex?: number,
    removeErrors?: boolean,
  ) => void;
  optionDisabled?: (ruleOption: string) => boolean;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
  nestedConditionRow?: ConditionsData[];
  nestedConditionCriteria?: string;
  nestedConditionIndex?: number;
  ruleIndex?: number;
  updateRules?: (newCondition: ConditionsData[] | ConditionsData) => void;
};

export const ConditionsFormRowFields = ({
  oldCondition,
  index,
  criteria,
  onRuleChange,
  conditionRow,
  conditionRulesData,
  handleSetErrors,
  optionDisabled,
  setRemoveAllClicked,
  nestedConditionRow,
  nestedConditionCriteria,
  nestedConditionIndex,
  ruleIndex,
  updateRules,
}: ConditionFormRowFieldsProps) => {
  const classes = useStyles({
    isNotSimpleCondition:
      criteria === criterias.not && !nestedConditionCriteria,
  });
  const rules = conditionRulesData?.rules ?? [];
  const paramsSchema =
    conditionRulesData?.[(oldCondition as PermissionCondition).rule]?.schema;

  const schema: RJSFSchema = paramsSchema;

  const uiSchema: UiSchema = {
    'ui:submitButtonOptions': {
      norender: true,
    },
    'ui:classNames': `${classes.params}`,
    'ui:field': 'array',
  };

  const customFields: RegistryFieldsType = { ArrayField: CustomArrayField };

  const handleConditionChange = (newCondition: PermissionCondition) => {
    setRemoveAllClicked(false);
    switch (criteria) {
      case criterias.condition: {
        onRuleChange({ condition: newCondition });
        break;
      }
      case criterias.allOf: {
        const updatedCriteria = conditionRow.allOf ?? [];
        updatedCriteria[index ?? 0] = newCondition;
        onRuleChange({ allOf: updatedCriteria });
        break;
      }
      case criterias.anyOf: {
        const updatedCriteria = conditionRow.anyOf ?? [];
        updatedCriteria[index ?? 0] = newCondition;
        onRuleChange({ anyOf: updatedCriteria });
        break;
      }
      case criterias.not: {
        onRuleChange({ not: newCondition });
        break;
      }
      default:
    }
  };

  const handleNestedConditionChange = (newCondition: PermissionCondition) => {
    if (
      !nestedConditionRow ||
      !nestedConditionCriteria ||
      nestedConditionIndex === undefined ||
      !updateRules
    ) {
      return;
    }
    const updatedNestedConditionRow: ConditionsData[] = nestedConditionRow.map(
      (c, i) => {
        if (i === nestedConditionIndex) {
          if (nestedConditionCriteria === criterias.not) {
            return {
              [nestedConditionCriteria]: newCondition,
            };
          }
          const updatedNestedConditionRules = (
            (c[
              nestedConditionCriteria as keyof ConditionsData
            ] as PermissionCondition[]) || []
          ).map((rule, rindex) => {
            return rindex === ruleIndex ? newCondition : rule;
          });

          return {
            [nestedConditionCriteria]: updatedNestedConditionRules,
          };
        }
        return c;
      },
    );

    updateRules(
      criteria === criterias.not
        ? updatedNestedConditionRow[0]
        : updatedNestedConditionRow,
    );
    if (newCondition.params && Object.keys(newCondition.params).length > 0) {
      handleSetErrors(
        [],
        criteria,
        nestedConditionCriteria,
        nestedConditionIndex,
        ruleIndex,
        true,
      );
    }
  };

  const onConditionChange = (newCondition: PermissionCondition) => {
    if (nestedConditionRow) {
      handleNestedConditionChange(newCondition);
    } else {
      handleConditionChange(newCondition);
    }
  };

  return (
    <Box className={classes.inputFieldContainer}>
      <Autocomplete
        className={classes.ruleKeyInput}
        options={rules ?? []}
        value={(oldCondition as PermissionCondition)?.rule || null}
        getOptionDisabled={option =>
          optionDisabled ? optionDisabled(option) : false
        }
        onChange={(_event, ruleVal?: string | null) =>
          onConditionChange({
            ...oldCondition,
            rule: ruleVal ?? '',
            params: {},
          } as PermissionCondition)
        }
        renderOption={option => (
          <RulesDropdownOption
            label={option ?? ''}
            rulesData={conditionRulesData}
          />
        )}
        renderInput={(params: any) => (
          <TextField
            {...params}
            className={classes.bgPaper}
            label="Rule"
            variant="outlined"
            placeholder="Select a rule"
            required
          />
        )}
      />
      <Box style={{ width: '50%' }}>
        {schema ? (
          <Form
            schema={paramsSchema}
            formData={(oldCondition as PermissionCondition)?.params || {}}
            validator={validator}
            uiSchema={uiSchema}
            fields={customFields}
            onChange={data =>
              onConditionChange({
                ...oldCondition,
                params: data.formData || {},
              } as PermissionCondition)
            }
            transformErrors={errors => {
              const hasErrors = errors.length > 0;
              if (nestedConditionRow) {
                handleSetErrors(
                  errors,
                  criteria,
                  nestedConditionCriteria,
                  nestedConditionIndex,
                  ruleIndex,
                  !hasErrors,
                );
              } else {
                handleSetErrors(
                  errors,
                  criteria,
                  undefined,
                  undefined,
                  index,
                  !hasErrors,
                );
              }
              return errors;
            }}
            showErrorList={false}
            liveValidate
          />
        ) : (
          <TextField
            className={classes.ruleValueInput}
            disabled
            label="string, string"
            required
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};
