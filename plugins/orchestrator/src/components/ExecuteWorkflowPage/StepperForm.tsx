import React from 'react';

import { Content, StructuredMetadataTable } from '@backstage/core-components';
import { JsonObject } from '@backstage/types';

import {
  Box,
  Button,
  makeStyles,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@material-ui/core';
import { FormProps, withTheme } from '@rjsf/core';
import { Theme as MuiTheme } from '@rjsf/material-ui';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

import { WorkflowInputSchemaStep } from '@janus-idp/backstage-plugin-orchestrator-common';

import SubmitButton from '../SubmitButton';

const Form = withTheme(MuiTheme);

const useStyles = makeStyles(_theme => ({
  // Hotfix: this should be fixed in the theme
  step: {
    '& form': {
      '& .field-array > div > div': {
        outline: 'inherit !important',
        padding: 'inherit !important',
        backgroundColor: 'inherit !important',

        '& div > div > div > div': {
          // unfortunately there are no better CSS selectors
          backgroundColor: 'inherit !important',
        },
      },
    },
  },
}));

const getCombinedData = (
  steps: WorkflowInputSchemaStep[],
  isComposedSchema: boolean,
): JsonObject => {
  if (!isComposedSchema) {
    return steps[0].data;
  }
  return steps.reduce<JsonObject>(
    (prev, { key, data }) => ({ ...prev, [key]: data }),
    {},
  );
};

const ReviewStep = ({
  busy,
  steps,
  isComposedSchema,
  handleBack,
  handleReset,
  handleExecute,
}: {
  busy: boolean;
  steps: WorkflowInputSchemaStep[];
  isComposedSchema: boolean;
  handleBack: () => void;
  handleReset: () => void;
  handleExecute: (getParameters: () => JsonObject) => Promise<void>;
}) => {
  const displayData: JsonObject = React.useMemo(() => {
    if (!isComposedSchema) {
      return steps[0].data;
    }
    return steps.reduce<JsonObject>(
      (prev, { title, data }) => ({ ...prev, [title]: data }),
      {},
    );
  }, [steps, isComposedSchema]);
  return (
    <Content>
      <Paper square elevation={0}>
        <Typography variant="h6">Review and run</Typography>
        <StructuredMetadataTable dense metadata={displayData} />
        <Box mb={4} />
        <Button onClick={handleBack} disabled={busy}>
          Back
        </Button>
        <Button onClick={handleReset} disabled={busy}>
          Reset
        </Button>
        <SubmitButton
          handleClick={() =>
            handleExecute(() => getCombinedData(steps, isComposedSchema))
          }
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
  step,
  onSubmit,
  children,
}: Pick<FormProps<JsonObject>, 'onSubmit' | 'children'> & {
  step: WorkflowInputSchemaStep;
}) => {
  const firstKey = Object.keys(step.schema.properties ?? {})[0];
  const uiSchema = React.useMemo(() => {
    const res: UiSchema<any, RJSFSchema, any> = firstKey
      ? { [firstKey]: { 'ui:autofocus': 'true' } }
      : {};
    for (const key of step.readonlyKeys) {
      res[key] = { 'ui:disabled': 'true' };
    }
    return res;
  }, [firstKey, step.readonlyKeys]);

  return (
    <Form
      validator={validator}
      showErrorList={false}
      noHtml5Validate
      formData={step.data}
      schema={{ ...step.schema, title: '' }} // title is in step
      onSubmit={onSubmit}
      uiSchema={uiSchema}
    >
      {children}
    </Form>
  );
};

const StepperForm = ({
  isComposedSchema,
  steps: inputSteps,
  handleExecute,
  isExecuting,
  onReset,
}: {
  isComposedSchema: boolean;
  steps: WorkflowInputSchemaStep[];
  handleExecute: (getParameters: () => JsonObject) => Promise<void>;
  isExecuting: boolean;
  onReset: () => void;
}) => {
  const styles = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const handleBack = () => setActiveStep(activeStep - 1);

  const [steps, setSteps] = React.useState([...inputSteps]);
  return (
    <>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps?.map((step, index) => (
          <Step key={step.key} className={styles.step}>
            <StepLabel
              aria-label={`Step ${index + 1} ${step.title}`}
              aria-disabled="false"
              tabIndex={0}
            >
              <Typography variant="h6" component="h2">
                {step.title}
              </Typography>
            </StepLabel>
            <StepContent>
              <FormWrapper
                step={step}
                onSubmit={e => {
                  const newStep: WorkflowInputSchemaStep = {
                    ...step,
                    data: e.formData ?? {},
                  };
                  const newSteps = [...steps];
                  newSteps.splice(index, 1, newStep);
                  setSteps(newSteps);
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
      {activeStep === steps.length && (
        <ReviewStep
          steps={steps}
          isComposedSchema={isComposedSchema}
          handleBack={handleBack}
          handleReset={() => {
            onReset();
            setSteps([...inputSteps]);
            setActiveStep(0);
          }}
          handleExecute={handleExecute}
          busy={isExecuting}
        />
      )}
    </>
  );
};

export default StepperForm;
