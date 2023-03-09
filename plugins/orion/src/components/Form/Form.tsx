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
  const [formState, setFormState] = useState<Record<string, JsonValue>>({});

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      setFormState(current => ({ ...current, ...e.formData }));
      onChange({ ...e, formData: formState });
    },
    [formState, onChange],
  );

  return (
    <JsonForm
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
        ['ui:ObjectFieldTemplate']: FluidFormLayout as any,
      }}
      transformErrors={transformErrors}
    >
      {children}
    </JsonForm>
  );
}
