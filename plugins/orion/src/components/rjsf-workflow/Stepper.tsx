import React, { useState, useCallback, type ReactNode } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form } from './Form/Form';
import { type FormProps, type IChangeEvent } from '@rjsf/core-v5';
import type { FormSchema } from '../types';

type StepperProps = Pick<FormProps, 'onSubmit'> & {
  formSchema: FormSchema;
  children?: ReactNode;
};

export function Stepper({
  formSchema,
  onSubmit,
  children,
}: StepperProps): JSX.Element {
  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleChange = useCallback(
    (e: IChangeEvent) =>
      setFormState(current => ({ ...current, ...e.formData })),
    [setFormState],
  );

  return (
    <Form
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={onSubmit}
      {...formSchema}
    >
      {children}
    </Form>
  );
}
