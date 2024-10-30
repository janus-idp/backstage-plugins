import React from 'react';

import type { JSONSchema7 } from 'json-schema';

import {
  FormDecoratorProps,
  OrchestratorFormApi,
  OrchestratorFormDecorator,
} from '@janus-idp/backstage-plugin-orchestrator-form-api';

class DefaultFormApi implements OrchestratorFormApi {
  getFormDecorator(_schema: JSONSchema7): OrchestratorFormDecorator {
    return (FormComponent: React.ComponentType<FormDecoratorProps>) =>
      FormComponent;
  }
}

export const defaultFormExtensionsApi = new DefaultFormApi();
