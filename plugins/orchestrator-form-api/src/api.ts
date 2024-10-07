import { createApiRef } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { FormProps } from '@rjsf/core';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { JSONSchema7 } from 'json-schema';

export type FormDecoratorProps = Partial<
  Pick<
    FormProps<JsonObject, JSONSchema7>,
    'formData' | 'formContext' | 'widgets' | 'onChange' | 'extraErrors'
  >
>;

export type OrchestratorFormDecorator = (
  FormComponent: React.ComponentType<FormDecoratorProps>,
) => React.ComponentType;

export interface OrchestratorFormApi {
  getFormDecorator(schema: JSONSchema7): OrchestratorFormDecorator;
}

export const orchestratorFormApiRef = createApiRef<OrchestratorFormApi>({
  id: 'plugin.orchestrator.form',
});
