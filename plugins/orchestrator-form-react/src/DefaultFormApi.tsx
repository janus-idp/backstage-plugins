import React from 'react';

import { JsonObject } from '@backstage/types';

import { FormProps } from '@rjsf/core';
import { JSONSchema7 } from 'json-schema';

import {
  OrchestratorFormApi,
  OrchestratorFormDecorator,
} from '@janus-idp/backstage-plugin-orchestrator-form-api';

class DefaultFormApi implements OrchestratorFormApi {
  getFormDecorator(): OrchestratorFormDecorator {
    return (
      FormComponent: React.ComponentType<
        Partial<FormProps<JsonObject, JSONSchema7>>
      >,
    ) => FormComponent;
  }
}

export const defaultFormExtensionsApi = new DefaultFormApi();
