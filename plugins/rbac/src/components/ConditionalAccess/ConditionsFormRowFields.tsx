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

import { calculateConditionIndex } from '../../utils/conditional-access-utils';
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
    '& div[class*="MuiInputBase-root"]': {
      backgroundColor: theme.palette.background.paper,
    },
    '& span': {
      color: theme.palette.textSubtle,
    },
    '& input': {
      color: theme.palette.textContrast,
    },
    '& fieldset.MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.grey[500],
    },
    '& div.MuiOutlinedInput-root': {
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.status.error,
        '&:hover': {
          borderColor: theme.palette.status.error,
        },
      },
    },
    '& label.MuiFormLabel-root.Mui-focused': {
      color: theme.palette.primary.light,
    },
    '& label.MuiFormLabel-root.Mui-error': {
      color: theme.palette.status.error,
    },
    '& div.MuiOutlinedInput-root:hover fieldset': {
      borderColor:
        theme.palette.type === 'dark' ? theme.palette.textContrast : 'unset',
    },
    '& label': {
      color: theme.palette.textSubtle,
    },
  },
  inputFieldContainer: {
    display: 'flex',
    flexFlow: 'row',
    gap: '10px',
    flexGrow: 1,
    margin: ({ isNotSimpleCondition }) =>
      isNotSimpleCondition ? '-1.5rem 0 0 1.85rem' : '0',
  },
}));

type ConditionFormRowFieldsProps = {
  oldCondition: Condition;
  index?: number;
  criteria: string;
  onRuleChange: (newCondition: ConditionsData) => void;
  conditionRow: Condition;
  conditionRulesData?: RulesData;
  handleSetErrors: (
    newErrors: RJSFValidationError[],
    currentCriteria: string,
    nestedCriteria?: string,
    conditionIndex?: number,
    nestedConditionRuleIndex?: number,
    removeErrors?: boolean,
  ) => void;
  optionDisabled?: (ruleOption: string) => boolean;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
  nestedConditionRow?: Condition[];
  nestedConditionCriteria?: string;
  nestedConditionIndex?: number;
  nestedConditionRuleIndex?: number;
  updateRules?: (newCondition: Condition[] | Condition) => void;
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
  nestedConditionRuleIndex,
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
        const updatedCriteria = (conditionRow as ConditionsData).allOf ?? [];
        updatedCriteria[index ?? 0] = newCondition;
        onRuleChange({ allOf: updatedCriteria });
        break;
      }
      case criterias.anyOf: {
        const updatedCriteria = (conditionRow as ConditionsData).anyOf ?? [];
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
    const updatedNestedConditionRow: Condition[] = nestedConditionRow.map(
      (c, i) => {
        if (i === nestedConditionIndex) {
          if (nestedConditionCriteria === criterias.not) {
            return {
              [nestedConditionCriteria]: newCondition,
            };
          }
          const updatedNestedConditionRules = (
            (c[
              nestedConditionCriteria as keyof Condition
            ] as PermissionCondition[]) || []
          ).map((rule, rindex) => {
            return rindex === nestedConditionRuleIndex ? newCondition : rule;
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
        nestedConditionRuleIndex,
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
        style={{ width: '50%', marginTop: '26px' }}
        className={classes.params}
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
              const conditionIndex =
                nestedConditionIndex !== undefined
                  ? calculateConditionIndex(
                      conditionRow as ConditionsData,
                      nestedConditionIndex,
                      criteria,
                    )
                  : index;
              if (nestedConditionRow) {
                handleSetErrors(
                  errors,
                  criteria,
                  nestedConditionCriteria,
                  conditionIndex,
                  nestedConditionRuleIndex,
                  !hasErrors,
                );
              } else {
                handleSetErrors(
                  errors,
                  criteria,
                  undefined,
                  conditionIndex,
                  undefined,
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
            style={{ width: '100%', marginTop: '26px' }}
            className={classes.params}
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
