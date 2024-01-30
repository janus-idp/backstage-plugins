import React from 'react';

import { Content, StructuredMetadataTable } from '@backstage/core-components';
import { JsonObject } from '@backstage/types';

import {
  Box,
  Button,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@material-ui/core';
import { FormProps, withTheme } from '@rjsf/core-v5';
import { Theme as MuiTheme } from '@rjsf/material-ui-v5';
import { UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { JSONSchema7 } from 'json-schema';

import SubmitButton from '../SubmitButton';

const MuiForm = withTheme<JsonObject>(MuiTheme);

const ReviewStep = ({
  busy,
  disableReset,
  formDataObjects,
  handleBack,
  handleReset,
  handleExecute,
}: {
  busy: boolean;
  disableReset: boolean;
  formDataObjects: JsonObject[];
  handleBack: () => void;
  handleReset: () => void;
  handleExecute: () => void;
}) => {
  const combinedFormData = React.useMemo(
    () =>
      formDataObjects.reduce<JsonObject>(
        (prev, cur) => ({ ...prev, ...cur }),
        {},
      ),
    [formDataObjects],
  );
  return (
    <Content>
      <Paper square elevation={0}>
        <Typography variant="h6">Review and run</Typography>
        <StructuredMetadataTable dense metadata={combinedFormData} />
        <Box mb={4} />
        <Button onClick={handleBack} disabled={busy}>
          Back
        </Button>
        <Button onClick={handleReset} disabled={busy || disableReset}>
          Reset
        </Button>
        <SubmitButton
          handleClick={handleExecute}
          submitting={busy}
          focusOnMount
        >
          Run
        </SubmitButton>
      </Paper>
    </Content>
  );
};

const FormWrapper = ({
  formData,
  schema,
  uiSchema = {},
  onSubmit,
  children,
}: Pick<
  FormProps<JsonObject>,
  'formData' | 'schema' | 'uiSchema' | 'onSubmit' | 'children'
>) => {
  const firstKey = Object.keys(schema?.properties ?? {})[0];
  uiSchema[firstKey] = firstKey
    ? { ...uiSchema[firstKey], 'ui:autofocus': 'true' }
    : uiSchema[firstKey];
  return (
    <MuiForm
      validator={validator}
      showErrorList={false}
      noHtml5Validate
      formData={formData}
      uiSchema={uiSchema}
      schema={{ ...schema, title: '' }} // title is in step
      onSubmit={onSubmit}
    >
      {children}
    </MuiForm>
  );
};

const StepperForm = ({
  refSchemas,
  initialState,
  disableInitialState = false,
  handleExecute,
  isExecuting,
}: {
  refSchemas: JSONSchema7[];
  initialState: JsonObject[];
  disableInitialState?: boolean;
  handleExecute: (getParameters: () => JsonObject) => Promise<void>;
  isExecuting: boolean;
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const handleBack = () => setActiveStep(activeStep - 1);

  const [formDataObjects, setFormDataObjects] =
    React.useState<JsonObject[]>(initialState);

  const getFormData = () =>
    formDataObjects.reduce<JsonObject>(
      (prev, curFormObject) => ({ ...prev, ...curFormObject }),
      {},
    );

  const resetFormDataObjects = React.useCallback(
    () =>
      setFormDataObjects(
        refSchemas.reduce<JsonObject[]>(prev => [...prev, {}], []),
      ),
    [refSchemas],
  );

  const uiSchema = React.useMemo(() => {
    if (!disableInitialState) {
      return {};
    }
    return initialState.reduce<UiSchema<JsonObject>>(
      (prev, cur) =>
        Object.keys(cur).reduce<UiSchema<JsonObject>>(
          (prev2, cur2) => ({
            ...prev2,
            [cur2]: { ...prev2[cur2], 'ui:disabled': 'true' },
          }),
          prev,
        ),
      {},
    );
  }, [disableInitialState, initialState]);

  return (
    <>
      <Stepper activeStep={activeStep} orientation="vertical">
        {refSchemas.map((schema, index) => (
          <Step key={schema.$id ?? index}>
            <StepLabel
              aria-label={`Step ${index + 1} ${schema.title}`}
              aria-disabled="false"
              tabIndex={0}
            >
              <Typography variant="h6" component="h2">
                {schema.title}
              </Typography>
            </StepLabel>
            <StepContent>
              <FormWrapper
                formData={formDataObjects[index]}
                schema={schema}
                uiSchema={uiSchema}
                onSubmit={e => {
                  const newDataObjects = [...formDataObjects];
                  newDataObjects.splice(index, 1, e.formData ?? {});
                  setFormDataObjects(newDataObjects);
                  setActiveStep(activeStep + 1);
                }}
              >
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  Next step
                </Button>
              </FormWrapper>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === refSchemas.length && (
        <ReviewStep
          formDataObjects={formDataObjects}
          handleBack={handleBack}
          handleReset={() => {
            resetFormDataObjects();
            setActiveStep(0);
          }}
          disableReset={disableInitialState}
          busy={isExecuting}
          handleExecute={() => handleExecute(() => getFormData())}
        />
      )}
    </>
  );
};

export default StepperForm;
