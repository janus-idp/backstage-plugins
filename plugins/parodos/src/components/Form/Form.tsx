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
} from '@material-ui/core';

type FormProps = Pick<
  JsonFormProps,
  'onSubmit' | 'disabled' | 'onChange' | 'className' | 'transformErrors'
> & {
  formSchema: FormSchema;
  children?: ReactNode;
};

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

  const currentStep = formSchema.steps[activeStep];

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(current => ({ ...current, ...e.formData }));
      onChange({ ...e, formData: formState });

      setActiveStep(prev => prev + 1);
    },
    [formState, onChange],
  );

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  return (
    <>
      <Stepper activeStep={activeStep} orientation="vertical">
        {formSchema.steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.schema.title}</StepLabel>
            <StepContent key={index}>
              <JsonForm
                idPrefix=""
                className={className}
                validator={validator}
                noHtml5Validate
                showErrorList={false}
                onChange={handleChange}
                formData={formState}
                formContext={{ formData: formState }}
                onSubmit={onSubmit}
                schema={currentStep.schema}
                disabled={disabled}
                uiSchema={{
                  ...currentStep.uiSchema,
                  ['ui:ObjectFieldTemplate']: FluidFormLayout as any,
                }}
                transformErrors={transformErrors}
              >
                {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
                <Button variant="contained" color="primary" type="submit">
                  Next
                </Button>
              </JsonForm>
            </StepContent>
          </Step>
        ))}
        {children}
      </Stepper>
    </>
  );
}
