import React from 'react';

import { ErrorPanel } from '@backstage/core-components';
import { useApiHolder } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { Grid } from '@material-ui/core';
import { withTheme } from '@rjsf/core';
import { Theme as MuiTheme } from '@rjsf/material-ui';
import { ErrorSchema, UiSchema } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';
import omit from 'lodash/omit';

import {
  FormDecoratorProps,
  orchestratorFormApiRef,
} from '@janus-idp/backstage-plugin-orchestrator-form-api';

import { defaultFormExtensionsApi } from '../DefaultFormApi';
import { useStepperContext } from '../utils/StepperContext';
import useValidator from '../utils/useValidator';
import StepperObjectField from './StepperObjectField';

const MuiForm = withTheme<JsonObject, JSONSchema7>(MuiTheme);

type OrchestratorFormWrapperProps = {
  schema: JSONSchema7;
  numStepsInMultiStepSchema?: number;
  children: React.ReactNode;
  formData: JsonObject;
  onChange: (formData: JsonObject) => void;
  uiSchema: UiSchema<JsonObject, JSONSchema7>;
};

const WrapperFormPropsContext =
  React.createContext<OrchestratorFormWrapperProps | null>(null);

const useWrapperFormPropsContext = (): OrchestratorFormWrapperProps => {
  const context = React.useContext(WrapperFormPropsContext);
  if (context === null) {
    throw new Error('OrchestratorFormWrapperProps not provided');
  }
  return context;
};

const FormComponent = (decoratorProps: FormDecoratorProps) => {
  const props = useWrapperFormPropsContext();
  const {
    numStepsInMultiStepSchema,
    uiSchema,
    schema,
    onChange,
    formData,
    children,
  } = props;
  const [extraErrors, setExtraErrors] = React.useState<
    ErrorSchema<JsonObject> | undefined
  >();
  const isMultiStep = numStepsInMultiStepSchema !== undefined;
  const { handleNext, activeStep, handleValidateStarted, handleValidateEnded } =
    useStepperContext();
  const [validationError, setValidationError] = React.useState<
    Error | undefined
  >();
  const validator = useValidator(isMultiStep);
  const getActiveKey = () => {
    if (!isMultiStep) {
      return undefined;
    }
    return Object.keys(schema.properties || {})[activeStep];
  };

  const onSubmit = async (_formData: JsonObject) => {
    setExtraErrors(undefined);
    let _extraErrors: ErrorSchema<JsonObject> | undefined = undefined;
    let _validationError: Error | undefined = undefined;
    if (decoratorProps.getExtraErrors) {
      try {
        handleValidateStarted();
        _extraErrors = await decoratorProps.getExtraErrors(formData);
        const activeKey = getActiveKey();
        setExtraErrors(
          activeKey && _extraErrors?.[activeKey]
            ? (_extraErrors[activeKey] as ErrorSchema<JsonObject>)
            : _extraErrors,
        );
      } catch (err) {
        _validationError = err as Error;
      } finally {
        handleValidateEnded();
      }
    }
    setValidationError(_validationError);
    if (
      (!_extraErrors || Object.keys(_extraErrors).length === 0) &&
      !_validationError &&
      activeStep < (numStepsInMultiStepSchema || 1)
    ) {
      handleNext();
    }
  };

  return (
    <Grid container spacing={2} direction="column" wrap="nowrap">
      {validationError && (
        <Grid item>
          <ErrorPanel error={validationError} />
        </Grid>
      )}
      <Grid item>
        <MuiForm
          {...omit(decoratorProps, 'extra')}
          fields={isMultiStep ? { ObjectField: StepperObjectField } : {}}
          uiSchema={uiSchema}
          validator={validator}
          schema={schema}
          formData={decoratorProps.formData || formData}
          noHtml5Validate
          extraErrors={extraErrors}
          onSubmit={e => onSubmit(e.formData || {})}
          onChange={e => {
            onChange(e.formData || {});
            if (decoratorProps.onChange) {
              decoratorProps.onChange(e);
            }
          }}
        >
          {children}
        </MuiForm>
      </Grid>
    </Grid>
  );
};

const OrchestratorFormWrapper = ({
  schema,
  uiSchema,
  ...props
}: OrchestratorFormWrapperProps) => {
  const formApi =
    useApiHolder().get(orchestratorFormApiRef) || defaultFormExtensionsApi;
  const NewComponent = React.useMemo(() => {
    const formDecorator = formApi.getFormDecorator(schema, uiSchema);
    return formDecorator(FormComponent);
  }, [schema, formApi, uiSchema]);
  return (
    <WrapperFormPropsContext.Provider value={{ schema, uiSchema, ...props }}>
      <NewComponent />
    </WrapperFormPropsContext.Provider>
  );
};

export default OrchestratorFormWrapper;
