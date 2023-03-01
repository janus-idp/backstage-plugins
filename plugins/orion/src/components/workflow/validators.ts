import { WorkFlowTaskParameterType } from '../types';

export type ValidationType = string;
// returns error text if validation fails or empty string if validation succeeds
export type ValidatorType = (value: string) => ValidationType;

export const VALIDATION_SUCCESS: ValidationType = '';

export const getParamValidator = (
  param: WorkFlowTaskParameterType,
): ValidatorType => {
  switch (param.type) {
    case 'EMAIL':
      return (value: string): ValidationType => {
        if (!value && !param.optional) {
          return 'This field is required';
        }

        if (!value?.includes('@')) {
          return 'This field must be a valid email';
        }

        return VALIDATION_SUCCESS;
      };
    case 'DATE':
      return (value: string): ValidationType => {
        if (!value && !param.optional) {
          return 'This field is required';
        }

        if (isNaN(Date.parse(value))) {
          // TODO: improve
          return 'This field must be a valid date';
        }

        return VALIDATION_SUCCESS;
      };
    case 'NUMBER':
      return (value: string): ValidationType => {
        if (!value && !param.optional) {
          return 'This field is required';
        }

        if (!['string', 'number'].includes(typeof value)) {
          return 'Unknown type of value';
        }

        if (isNaN(value as unknown as number) || isNaN(parseFloat(value))) {
          return 'This field must be a number';
        }

        return VALIDATION_SUCCESS;
      };
    case 'URL':
      return (value: string): ValidationType => {
        if (!value && !param.optional) {
          return 'This field is required';
        }
        // TODO: improve
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return 'This field must be a valid URL';
        }
        return VALIDATION_SUCCESS;
      };
    case 'MOCK-SELECT':
    // fallthrough
    case 'PASSWORD':
    // fallthrough
    case 'TEXT':
    // fallthrough
    default:
      return (value: string): ValidationType => {
        if (!value && !param.optional) {
          return 'This field is required';
        }

        return VALIDATION_SUCCESS;
      };
  }
};
