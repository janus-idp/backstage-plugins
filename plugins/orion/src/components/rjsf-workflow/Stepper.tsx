import React, { useState, useCallback, type ReactNode, FormEvent } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form } from './Form/Form';
import { FormState, type FormProps, type IChangeEvent } from '@rjsf/core-v5';
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

  const handleSubmit = async (data: IChangeEvent, e: FormEvent<any>) => {
    if(!onSubmit) {
      return;
    }
    await onSubmit(data, e);
  };

  return (
    <Form
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={handleSubmit}
      {...formSchema}
    >
      {children}
    </Form>
  );
}
