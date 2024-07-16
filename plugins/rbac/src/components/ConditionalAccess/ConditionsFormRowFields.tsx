import React from 'react';

import { PermissionCondition } from '@backstage/plugin-permission-common';

import { Box, makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import Form from '@rjsf/mui';
import { RegistryFieldsType, RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { criterias } from './const';
import { CustomArrayField } from './CustomArrayField';
import { RulesDropdownOption } from './RulesDropdownOption';
import { ConditionsData, RuleParamsErrors, RulesData } from './types';

const useStyles = makeStyles(theme => ({
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
}));

type ConditionFormRowFieldsProps = {
  oldCondition: PermissionCondition;
  index?: number;
  criteria: string;
  onRuleChange: (newCondition: ConditionsData) => void;
  conditionRow: ConditionsData;
  conditionRulesData?: RulesData;
  setErrors: React.Dispatch<React.SetStateAction<RuleParamsErrors | undefined>>;
  optionDisabled?: (ruleOption: string) => boolean;
  setRemoveAllClicked: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ConditionsFormRowFields = ({
  oldCondition,
  index,
  criteria,
  onRuleChange,
  conditionRow,
  conditionRulesData,
  setErrors,
  optionDisabled,
  setRemoveAllClicked,
}: ConditionFormRowFieldsProps) => {
  const classes = useStyles();
  const rules = conditionRulesData?.rules ?? [];
  const paramsSchema = conditionRulesData?.[oldCondition.rule]?.schema;

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

  return (
    <Box
      style={{ display: 'flex', flexFlow: 'row', gap: '10px', flexGrow: '1' }}
    >
      <Autocomplete
        style={{ marginTop: '27px', width: '50%' }}
        className={classes.params}
        options={rules ?? []}
        value={oldCondition?.rule || null}
        getOptionDisabled={option =>
          optionDisabled ? optionDisabled(option) : false
        }
        onChange={(_event, ruleVal?: string | null) =>
          handleConditionChange({
            ...oldCondition,
            rule: ruleVal ?? '',
            params: {},
          })
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
            formData={oldCondition?.params || {}}
            validator={validator}
            uiSchema={uiSchema}
            fields={customFields}
            onChange={data =>
              handleConditionChange({
                ...oldCondition,
                params: data.formData || {},
              })
            }
            transformErrors={errors => {
              setErrors({ [criteria]: errors });
              return errors;
            }}
            showErrorList={false}
            liveValidate
          />
        ) : (
          <TextField
            className={classes.params}
            style={{ width: '100%', marginTop: '27px' }}
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
