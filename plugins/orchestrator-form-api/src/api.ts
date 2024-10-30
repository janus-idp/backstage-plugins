import { createApiRef } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { FormProps } from '@rjsf/core';
import { ErrorSchema, UiSchema } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';

/**
 * Type definition for properties passed to a form decorator component.
 * This interface extends selected fields from `FormProps` provided by `react-jsonschema-form`,
 * with additional custom functionality.
 *
 * @see {@link https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props|RJSF Form Props Documentation}
 *
 * Core properties include:
 * - formData: The form's current data
 * - formContext: Contextual data shared across form components
 * - widgets: Custom widget components for form fields
 * - onChange: Handler for form data changes
 * - customValidate: Custom validation function
 *
 * Additional properties:
 * - getExtraErrors: Async function to fetch additional validation errors.
 *   This replaces the static 'extraErrors' prop from react-jsonschema-form, which can't be used as is, since onSubmit isn't exposed.
 *   The orchestrator form component will call getExtraErrors when running onSubmit.
 */
export type FormDecoratorProps = Pick<
  FormProps<JsonObject, JSONSchema7>,
  'formData' | 'formContext' | 'widgets' | 'onChange' | 'customValidate'
> & {
  getExtraErrors?: (
    formData: JsonObject,
  ) => Promise<ErrorSchema<JsonObject>> | undefined;
};

export type OrchestratorFormDecorator = (
  FormComponent: React.ComponentType<FormDecoratorProps>,
) => React.ComponentType;

export interface OrchestratorFormApi {
  getFormDecorator(
    schema: JSONSchema7,
    uiSchema: UiSchema<JsonObject, JSONSchema7>,
  ): OrchestratorFormDecorator;
}

export const orchestratorFormApiRef = createApiRef<OrchestratorFormApi>({
  id: 'plugin.orchestrator.form',
});
