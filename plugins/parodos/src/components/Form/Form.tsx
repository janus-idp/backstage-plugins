import React, { useState, useCallback, type ReactNode } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form as JsonForm } from './RJSF';
import {
  type FormProps as JsonFormProps,
  type IChangeEvent,
} from '@rjsf/core-v5';
import type { FormSchema } from '../types';
import { FluidFormLayout } from '../layouts/FluidFormLayout';
import { JsonValue } from '@backstage/types';
import {
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Button,
  makeStyles,
} from '@material-ui/core';
import cs from 'classnames';

type FormProps = Pick<
  JsonFormProps,
  'disabled' | 'onChange' | 'className' | 'transformErrors'
> &
  Required<Pick<JsonFormProps, 'onSubmit'>> & {
    formSchema: FormSchema;
    children?: ReactNode;
  };

const useStyles = makeStyles(theme => ({
  stepLabel: {
    '& span': {
      fontSize: '1.25rem',
    },
  },
  form: {
    '& h5': {
      fontSize: theme.typography.fontSize,
    },
    '& h5 + hr': {
      display: 'none',
    },
  },
}));

export function Form({
  formSchema,
  onSubmit,
  onChange = (e: IChangeEvent) => e,
  disabled = false,
  className,
  transformErrors,
  children,
}: FormProps): JSX.Element {
  const [activeStep, setActiveStep] = useState(0);
  const [formState, setFormState] = useState<Record<string, JsonValue>>({});
  const styles = useStyles();

  const currentStep = formSchema.steps[activeStep];

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(current => ({ ...current, ...e.formData }));
      onChange({ ...e, formData: formState });
    },
    [formState, onChange],
  );

  const handleNext = async (data: IChangeEvent, e: React.FormEvent<any>) => {
    setFormState(current => ({ ...current, ...data.formData }));

    if (activeStep === formSchema.steps.length - 1) {
      await onSubmit(data, e);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const TheForm = (
    <JsonForm
      idPrefix=""
      className={cs(styles.form, className)}
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={handleNext}
      schema={currentStep.schema}
      disabled={disabled}
      uiSchema={{
        ...currentStep.uiSchema,
        ['ui:ObjectFieldTemplate']: FluidFormLayout as any,
      }}
      transformErrors={transformErrors}
    >
      {formSchema.steps.length === 1 ? (
        children
      ) : (
        <>
          {activeStep > 0 && <Button onClick={handleBack}>PREVIOUS</Button>}
          <Button variant="contained" color="primary" type="submit">
            NEXT
          </Button>
        </>
      )}
    </JsonForm>
  );

  if (formSchema.steps.length === 1) {
    return TheForm;
  }

  return (
    <>
      <Stepper activeStep={activeStep} orientation="vertical">
        {formSchema.steps.map((step, index) => (
          <Step key={index}>
            <StepLabel className={styles.stepLabel}>
              {step.schema.title}
            </StepLabel>
            <StepContent key={index}>{TheForm}</StepContent>
          </Step>
        ))}
      </Stepper>
    </>
  );
}
