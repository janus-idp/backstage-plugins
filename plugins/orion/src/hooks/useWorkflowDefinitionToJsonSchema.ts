import { useGetWorkflowDefinition } from './useGetWorkflowDefinitions';
import {
  type WorkFlowTaskParameterType,
  workflowDefinitionSchema,
  WorkflowDefinition,
} from '../models/workflowDefinitionSchema';
import { assert } from 'assert-ts';
import { FormSchema } from '../components/types';
import { type AsyncState } from 'react-use/lib/useAsync';

export function getJsonSchemaType(type: WorkFlowTaskParameterType) {
  switch (type) {
    case 'PASSWORD':
    case 'TEXT':
      return {
        type: 'string',
      };
    case 'NUMBER':
      return {
        type: 'number',
      };
    case 'DATE':
      return {
        type: 'string',
        format: 'date',
      };
    case 'EMAIL':
      return {
        type: 'string',
        format: 'email',
      };
    case 'MOCK-SELECT':
      return {
        type: 'array',
      };
    case 'URL':
      return {
        type: 'string',
        pattern: '^(https?)://',
      };
    default:
      return {
        type: 'string',
      };
  }
}

export function getUiSchema(type: WorkFlowTaskParameterType) {
  switch (type) {
    case 'PASSWORD':
      return {
        'ui:emptyValue': undefined,
        'ui:widget': 'password',
      };
    case 'TEXT':
      return {
        'ui:emptyValue': undefined,
      };
    case 'EMAIL':
      return {
        'ui:widget': 'email',
      };
    case 'URL':
    case 'NUMBER':
      return {};
    default:
      return {};
  }
}

export function jsonSchemaFromWorkflowDefinition(
  workflowDefinition: WorkflowDefinition,
): FormSchema {
  const parameters = workflowDefinition.tasks.flatMap(x => x.parameters);

  const schema: Record<string, any> = {
    type: 'object',
    title: workflowDefinition.description ?? workflowDefinition.type,
    properties: {},
    required: [],
  };

  const uiSchema: Record<string, any> = {};

  for (const { key, type, description, optional, options = [] } of parameters) {
    const required = !optional;

    schema.properties[key] = {
      title: key,
      ...getJsonSchemaType(type),
    };

    if (options.length > 0) {
      const selectOptions = {
        enum: options.map(option => option.key),
        enumNames: options.map(option => option.value),
      };

      schema.properties[key] = {
        ...schema.properties[key],
        type: 'string',
        ...selectOptions,
      };
    }

    uiSchema[key] = {
      ...getUiSchema(type),
      'ui:help': description,
      'ui:autocomplete': 'Off',
    };

    if (required) {
      schema.required.push(key);
    }
  }

  return { schema, uiSchema };
}

export function useWorkflowDefinitionToJsonSchema(
  workflowDefinition: string,
  filterType: 'byId' | 'byType',
): AsyncState<FormSchema> {
  const result = useGetWorkflowDefinition(workflowDefinition, filterType);

  if (!result.value) {
    return { ...result, value: undefined };
  }

  const { value: definition } = result;

  const parseResult = workflowDefinitionSchema.safeParse(definition);

  if (result.error) {
    return { loading: false, error: result.error, value: undefined };
  }

  assert(parseResult.success, `workflowDefinitionSchema parse failed.`);

  const { data: raw } = parseResult;

  const formSchema = jsonSchemaFromWorkflowDefinition(raw);

  return { value: formSchema, loading: false, error: undefined };
}
