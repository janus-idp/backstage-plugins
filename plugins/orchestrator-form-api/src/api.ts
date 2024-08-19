import { createApiRef } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { FormProps } from '@rjsf/core';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { JSONSchema7 } from 'json-schema';

export type OrchestratorFormDecorator = (
  FormComponent: React.ComponentType<
    Partial<FormProps<JsonObject, JSONSchema7>>
  >,
) => React.ComponentType;

export interface OrchestratorFormApi {
  getFormDecorator(): OrchestratorFormDecorator;
}

export const orchestratorFormApiRef = createApiRef<OrchestratorFormApi>({
  id: 'plugin.orchestrator.form',
});
