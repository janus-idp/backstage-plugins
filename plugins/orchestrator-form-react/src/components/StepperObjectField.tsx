import React from 'react';

import { JsonObject } from '@backstage/types';

import ObjectField from '@rjsf/core/lib/components/fields/ObjectField';
import { ErrorSchema, FieldProps, IdSchema } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';

import OrchestratorFormStepper, {
  OrchestratorFormStep,
  OrchestratorFormToolbar,
} from './OrchestratorFormStepper';

const StepperObjectField = ({
  formData,
  schema,
  uiSchema,
  onChange,
  registry,
  idSchema,
  errorSchema,
  ...props
}: FieldProps<JsonObject, JSONSchema7>) => {
  if (schema.properties === undefined) {
    throw new Error(
      "Stepper object field is not supported for schema that doesn't contain properties",
    );
  }
  const steps = Object.entries(schema.properties).reduce<
    OrchestratorFormStep[]
  >((prev, [key, subSchema]) => {
    if (typeof subSchema === 'boolean') {
      return prev;
    }
    return [
      ...prev,
      {
        content: (
          <>
            <ObjectField<JsonObject, JSONSchema7>
              {...props}
              schema={{ ...subSchema, title: '' }} // the title is in the step
              uiSchema={uiSchema?.[key] || {}}
              formData={(formData?.[key] as JsonObject) || {}}
              onChange={data => {
                onChange({ ...formData, [key]: data });
              }}
              idSchema={idSchema[key] as IdSchema<JsonObject>}
              registry={{
                ...registry,
                fields: {
                  ...registry.fields,
                  ObjectField: ObjectField, // undo override of objectfield
                },
              }}
              errorSchema={errorSchema?.[key] as ErrorSchema<JsonObject>}
            />
            <OrchestratorFormToolbar />
          </>
        ),
        title: subSchema.title || key,
        key,
      },
    ];
  }, []);
  return <OrchestratorFormStepper steps={steps} />;
};

export default StepperObjectField;
