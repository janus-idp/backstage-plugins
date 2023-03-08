import React, { useState, useCallback, type ReactNode } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form } from './Form/Form';
import { type FormProps, type IChangeEvent } from '@rjsf/core-v5';
import type { FormSchema } from '../types';
import { FluidLayout } from '../layouts/FluidLayout';
import { JsonValue } from '@backstage/types';

type StepperProps = Pick<
  FormProps,
  'onSubmit' | 'disabled' | 'onChange' | 'className'
> & {
  formSchema: FormSchema;
  children?: ReactNode;
};

export function Stepper({
  formSchema,
  onSubmit,
  onChange = (e: IChangeEvent) => e,
  disabled = false,
  className,
  children,
}: StepperProps): JSX.Element {
  const [formState, setFormState] = useState<Record<string, JsonValue>>({});

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(current => ({ ...current, ...e.formData }));
      onChange({ ...e, formData: formState });
    },
    [formState, onChange],
  );

  return (
    <Form
      className={className}
      validator={validator}
      noHtml5Validate
      showErrorList={false}
      onChange={handleChange}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={onSubmit}
      schema={formSchema.schema}
      disabled={disabled}
      uiSchema={{
        ...formSchema.uiSchema,
        ['ui:ObjectFieldTemplate']: FluidLayout as any,
      }}
    >
      {children}
    </Form>
  );
}
