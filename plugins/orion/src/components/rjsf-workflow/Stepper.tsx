import React, { useState, useCallback } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form } from './Form/Form';
import { IChangeEvent } from '@rjsf/core-v5';
import { type JsonValue } from '@backstage/types';
import { FormSchema } from '../types';

interface StepperProps {
  formSchema: FormSchema;
}

export function Stepper(props: StepperProps): JSX.Element {
  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleChange = useCallback(
    (e: IChangeEvent) =>
      setFormState(current => ({ ...current, ...e.formData })),
    [setFormState],
  );

  const handleNext = async ({
    formData = {},
  }: {
    formData?: Record<string, JsonValue>;
  }) => {
    setFormState(current => ({ ...current, ...formData }));
  };

  return (
    <Form
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={handleNext}
      {...props.formSchema}
    />
  );
}
