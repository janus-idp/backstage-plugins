import React, { useState, useCallback, type ReactNode, useRef } from 'react';
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
  StepLabel,
  Stepper,
  Button,
  ButtonGroup,
} from '@material-ui/core';
import { FluidObjectFieldTemplate } from '../layouts/FluidObjectFieldTemplate';
import { OutlinedBaseInputTemplate } from './widgets/TextAreaWidget';
import ArrayFieldTemplate from './Templates/ArrayFieldTemplate';
import { default as CoreForm } from '@rjsf/core-v5';
import { useStyles } from './styles';

type FormProps = Pick<
  JsonFormProps,
  'disabled' | 'onChange' | 'className' | 'transformErrors' | 'fields'
> &
  Required<Pick<JsonFormProps, 'onSubmit'>> & {
    formSchema: FormSchema;
    title?: string;
    hideTitle?: boolean;
    stepLess?: boolean;
    children?: ReactNode;
  };

export function Form({
  formSchema,
  title,
  onSubmit,
  onChange = (e: IChangeEvent) => e,
  disabled = false,
  className,
  transformErrors,
  hideTitle = false,
  stepLess = false,
  children,
  ...props
}: FormProps): JSX.Element {
  const [activeStep, setActiveStep] = useState(0);
  const [formState, setFormState] = useState<Record<string, JsonValue>>({});
  const styles = useStyles();
  const formRef = useRef<CoreForm>(null);

  const currentStep = formSchema.steps[activeStep];

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      onChange(e);
      setFormState(current => ({ ...current, ...e.formData }));
    },
    [onChange],
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
      ref={formRef}
      idPrefix=""
      className={className}
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState, form: formRef }}
      onSubmit={handleNext}
      schema={currentStep.schema}
      disabled={disabled}
      templates={{
        ObjectFieldTemplate: FluidObjectFieldTemplate,
        BaseInputTemplate: OutlinedBaseInputTemplate as any,
        ArrayFieldTemplate: ArrayFieldTemplate,
      }}
      uiSchema={{
        ...currentStep.uiSchema,
        ['ui:title']: title,
        ['ui:show-title']: hideTitle === false,
      }}
      transformErrors={transformErrors}
      {...props}
    >
      {stepLess ? (
        children
      ) : (
        <ButtonGroup className={styles.buttonContainer} variant="contained">
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
        </ButtonGroup>
      )}
    </JsonForm>
  );

  if (stepLess) {
    return TheForm;
  }

  return (
    <>
      <Stepper
        activeStep={activeStep}
        orientation="horizontal"
        className={styles.stepper}
      >
        {formSchema.steps.map((step, index) => (
          <Step key={index}>
            {hideTitle === false && (
              <StepLabel className={styles.stepLabel}>{step.title}</StepLabel>
            )}
          </Step>
        ))}
      </Stepper>
      <div className={styles.formWrapper}>
        <>
          {TheForm}
          {children}
        </>
      </div>
    </>
  );
}
