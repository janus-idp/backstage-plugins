import React from 'react';

import { useApiHolder } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { withTheme } from '@rjsf/core';
import { Theme as MuiTheme } from '@rjsf/material-ui';
import { UiSchema } from '@rjsf/utils';
import { JSONSchema7 } from 'json-schema';

import {
  FormDecoratorProps,
  orchestratorFormApiRef,
} from '@janus-idp/backstage-plugin-orchestrator-form-api';

import { defaultFormExtensionsApi } from '../DefaultFormApi';
import { useStepperContext } from '../utils/StepperContext';
import useValidator from '../utils/validator';
import StepperObjectField from './StepperObjectField';

const MuiForm = withTheme<JsonObject, JSONSchema7>(MuiTheme);

type OrchestratorFormWrapperProps = {
  schema: JSONSchema7;
  numStepsInMultiStepSchema?: number;
  children: React.ReactNode;
  formData: JsonObject;
  onSubmit: (formData: JsonObject) => void;
  uiSchema: UiSchema<JsonObject>;
};

const OrchestratorFormWrapper = ({
  schema,
  numStepsInMultiStepSchema,
  formData,
  onSubmit,
  children,
  uiSchema,
}: OrchestratorFormWrapperProps) => {
  const formApi =
    useApiHolder().get(orchestratorFormApiRef) || defaultFormExtensionsApi;
  const formDecorator = formApi.getFormDecorator(schema);
  const { handleNext, activeStep } = useStepperContext();
  const isMultiStep = numStepsInMultiStepSchema !== undefined;
  const validator = useValidator(isMultiStep);

  const FormComponent = (decoratorProps: FormDecoratorProps) => {
    return (
      <MuiForm
        {...decoratorProps}
        fields={isMultiStep ? { ObjectField: StepperObjectField } : {}}
        uiSchema={uiSchema}
        validator={validator}
        schema={schema}
        noHtml5Validate
        onSubmit={e => {
          if (
            decoratorProps.extraErrors &&
            Object.keys(decoratorProps.extraErrors).length > 0
          ) {
            return;
          }
          if (activeStep < (numStepsInMultiStepSchema || 1)) {
            onSubmit(e.formData || {});
            handleNext();
          }
        }}
        formData={decoratorProps.formData || formData}
      >
        {children}
      </MuiForm>
    );
  };

  const NewComponent = formDecorator(FormComponent);
  return <NewComponent />;
};

export default OrchestratorFormWrapper;
