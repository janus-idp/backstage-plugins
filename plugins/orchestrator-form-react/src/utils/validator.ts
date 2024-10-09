import React from 'react';

import { JsonObject } from '@backstage/types';

import {
  ErrorSchema,
  RJSFValidationError,
  ValidationData,
  ValidatorType,
} from '@rjsf/utils';
import validatorAjv from '@rjsf/validator-ajv8';
import _validator from '@rjsf/validator-ajv8/lib/validator';
import { JSONSchema7 } from 'json-schema';

import { useStepperContext } from './StepperContext';

const useValidator = (
  isMultiStepSchema: boolean,
): ValidatorType<JsonObject, JSONSchema7> => {
  const { activeStep } = useStepperContext();
  const validator = React.useMemo<
    ValidatorType<JsonObject, JSONSchema7>
  >(() => {
    return {
      validateFormData: (
        formData: JsonObject,
        _schema: JSONSchema7,
      ): ValidationData<JsonObject> => {
        // if multi step form, return only errors of current step
        const { errors, errorSchema } = validatorAjv.validateFormData(
          formData,
          _schema,
        );
        if (!isMultiStepSchema) {
          return { errors, errorSchema };
        }
        const activeKey = Object.keys(_schema.properties || {})[activeStep];
        return {
          errors: errors.filter(err =>
            err.property?.startsWith(`.${activeKey}.`),
          ),
          errorSchema: errorSchema[activeKey] || {},
        };
      },
      toErrorList: (
        errorSchema?: ErrorSchema<any>,
        fieldPath?: string[],
      ): RJSFValidationError[] => {
        return validatorAjv.toErrorList(errorSchema, fieldPath);
      },
      isValid: (
        _schema: JSONSchema7,
        formData: JsonObject | undefined,
        rootSchema: JSONSchema7,
      ) => {
        return validatorAjv.isValid(_schema, formData, rootSchema);
      },
      rawValidation: (_schema: JSONSchema7, formData?: JsonObject) =>
        validatorAjv.rawValidation(_schema, formData),
    };
  }, [isMultiStepSchema, activeStep]);
  return validator;
};

export default useValidator;
