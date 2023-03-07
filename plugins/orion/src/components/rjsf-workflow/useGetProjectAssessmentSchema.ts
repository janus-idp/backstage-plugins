import { useMemo } from 'react';
import { getUiSchema } from '../../hooks/useWorkflowDefinitionToJsonSchema';
import { FormSchema } from '../types';

export function useGetProjectAssessmentSchema(
  formSchema: FormSchema | undefined,
): FormSchema {
  // TODO: tidy this up.  Use deepmerge maybe
  return useMemo(
    () =>
      !formSchema
        ? {}
        : {
            ...formSchema,
            schema: {
              properties: {
                projectName: {
                  title: 'Project Name',
                  type: 'string',
                },
                ...(formSchema.schema.properties as any),
              },
              required: [...(formSchema.schema.required as any), 'projectName'],
            },
            uiSchema: {
              projectName: {
                ...getUiSchema('TEXT'),
              },
              ...formSchema.uiSchema,
            },
          },
    [formSchema],
  ) as FormSchema;
}
