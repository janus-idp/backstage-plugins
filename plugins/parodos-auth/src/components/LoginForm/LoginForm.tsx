import React, { useCallback, useState, type ReactNode } from 'react';
import validator from '@rjsf/validator-ajv8';
import { Form as JsonForm } from './RJSF';
import {
  type FormProps as JsonFormProps,
  type IChangeEvent,
} from '@rjsf/core-v5';
import { makeStyles } from '@material-ui/core';
import { OutlinedBaseInputTemplate } from './widgets/TextAreaWidget';
import type { JsonValue } from '@backstage/types';
import { schema, uiSchema } from './rjsfSchema';
import { UiSchema } from '@rjsf/utils';

type FormProps = Pick<
  JsonFormProps,
  'disabled' | 'onChange' | 'className' | 'transformErrors' | 'fields'
> &
  Required<Pick<JsonFormProps, 'onSubmit'>> & {
    title?: string;
    children?: ReactNode;
  };

const useStyles = makeStyles(_theme => ({
  form: {},
}));

export function LoginForm({
  title,
  onSubmit,
  onChange = (e: IChangeEvent) => e,
  disabled = false,
  className,
  transformErrors,
  children,
  ...props
}: FormProps): JSX.Element {
  const styles = useStyles();
  const [formState, setFormState] = useState<Record<string, JsonValue>>({});

  const handleChange = useCallback(
    (e: IChangeEvent) => {
      onChange(e);
      setFormState(current => ({ ...current, ...e.formData }));
    },
    [onChange],
  );

  return (
    <JsonForm
      {...props}
      className={styles.form}
      noHtml5Validate
      validator={validator}
      showErrorList={false}
      formData={formState}
      formContext={{ formData: formState }}
      onSubmit={onSubmit}
      schema={schema}
      disabled={disabled}
      onChange={handleChange}
      templates={{
        BaseInputTemplate: OutlinedBaseInputTemplate as any,
      }}
      uiSchema={uiSchema}
      transformErrors={transformErrors}
    >
      {children}
    </JsonForm>
  );
}
