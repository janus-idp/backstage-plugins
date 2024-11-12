import { JsonObject } from '@backstage/types';

import {
  createErrorHandler,
  CustomValidator,
  ErrorSchema,
  RJSFValidationError,
  unwrapErrorHandler,
  ValidationData,
  validationDataMerge,
  ValidatorType,
} from '@rjsf/utils';
import validatorAjv from '@rjsf/validator-ajv8';
import _validator from '@rjsf/validator-ajv8/lib/validator';
import type { JSONSchema7 } from 'json-schema';

import { useStepperContext } from './StepperContext';

// add the activeStep to the validator to force rjsf form to rerender when activeStep changes. This doesn't happen because it assumes function are equal.
// see https://github.com/rjsf-team/react-jsonschema-form/blob/v5.18.5/packages/utils/src/deepEquals.ts#L12

export type ValidatorTypeForceRender = ValidatorType<
  JsonObject,
  JSONSchema7
> & {
  activeStep: number;
};

const useValidator = (isMultiStepSchema: boolean) => {
  const { activeStep } = useStepperContext();
  const validator: ValidatorTypeForceRender = {
    activeStep,
    validateFormData: (
      formData: JsonObject,
      _schema: JSONSchema7,
      customValidate: CustomValidator<JsonObject, JSONSchema7, any>,
    ): ValidationData<JsonObject> => {
      let validationData = validatorAjv.validateFormData(formData, _schema);

      if (customValidate) {
        const errorHandler = customValidate(
          formData,
          createErrorHandler<JsonObject>(formData),
        );
        const userErrorSchema = unwrapErrorHandler<JsonObject>(errorHandler);
        validationData = validationDataMerge<JsonObject>(
          validationData,
          userErrorSchema,
        );
      }

      if (!isMultiStepSchema) {
        return validationData;
      }

      const activeKey = Object.keys(_schema.properties || {})[activeStep];
      return {
        errors: validationData.errors.filter(err =>
          err.property?.startsWith(`.${activeKey}.`),
        ),
        errorSchema: validationData.errorSchema[activeKey] || {},
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

  return validator;
};

export default useValidator;
