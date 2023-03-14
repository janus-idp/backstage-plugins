import React, { useState, useCallback, type ReactNode } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form as JsonForm } from './RJSF';
import {
  type FormProps as JsonFormProps,
  type IChangeEvent,
} from '@rjsf/core-v5';
import type { FormSchema } from '../types';
import { JsonValue } from '@backstage/types';
import {
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Button,
  makeStyles,
} from '@material-ui/core';
import { FluidObjectFieldTemplate } from '../layouts/FluidObjectFieldTemplate';

type FormProps = Pick<
  JsonFormProps,
  'disabled' | 'onChange' | 'className' | 'transformErrors'
> &
  Required<Pick<JsonFormProps, 'onSubmit'>> & {
    formSchema: FormSchema;
    title?: string;
    hideTitle?: boolean;
    children?: ReactNode;
  };

const useStyles = makeStyles(theme => ({
  stepLabel: {
    '& span': {
      fontSize: '1.25rem',
    },
  },
  previous: {
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(1),
    textTransform: 'uppercase',
  },
  next: {
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
  },
}));

export function Form({
  formSchema,
  title,
  onSubmit,
  onChange = (e: IChangeEvent) => e,
  disabled = false,
  className,
  transformErrors,
  hideTitle = false,
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
      className={className}
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={handleNext}
      schema={currentStep.schema}
      disabled={disabled}
      templates={{
        ObjectFieldTemplate: FluidObjectFieldTemplate,
      }}
      uiSchema={{
        ...currentStep.uiSchema,
        ['ui:title']: title,
        ['ui:show-title']: hideTitle === false,
      }}
      transformErrors={transformErrors}
    >
      {formSchema.steps.length === 1 ? (
        children
      ) : (
        <div>
          <Button
            disabled={activeStep === 0}
            className={styles.previous}
            onClick={handleBack}
          >
            PREVIOUS
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className={styles.next}
          >
            NEXT
          </Button>
        </div>
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
            {hideTitle === false && (
              <StepLabel className={styles.stepLabel}>
                {step.title}
              </StepLabel>
            )}
            <StepContent key={index}>{TheForm}</StepContent>
          </Step>
        ))}
      </Stepper>
      {children}
    </>
  );
}
