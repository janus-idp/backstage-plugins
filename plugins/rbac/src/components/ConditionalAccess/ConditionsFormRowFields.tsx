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
  bgPaper: {
    backgroundColor: theme.palette.background.paper,
  },
  params: {
    fontFamily: theme.typography.fontFamily,
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
  optionDisabled: (ruleOption: string) => boolean;
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
        options={rules ?? []}
        value={oldCondition?.rule || null}
        getOptionDisabled={option => optionDisabled(option)}
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
            formData={oldCondition?.params ?? null}
            validator={validator}
            uiSchema={uiSchema}
            fields={customFields}
            onChange={data =>
              handleConditionChange({
                ...oldCondition,
                params: data.formData ?? {},
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
            style={{ width: '100%', marginTop: '27px' }}
            className={classes.bgPaper}
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
