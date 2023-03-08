import { useGetWorkflowDefinition } from './useGetWorkflowDefinitions';
import {
  type WorkFlowTaskParameterType,
  workflowDefinitionSchema,
} from '../models/workflowDefinitionSchema';
import { assert } from 'assert-ts';
import { FormSchema } from '../components/types';
import { type AsyncState } from 'react-use/lib/useAsync';

export function getJsonSchemaType(type: WorkFlowTaskParameterType) {
  switch (type) {
    case 'PASSWORD':
    case 'TEXT':
    case 'URL':
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

  const parameters = raw.tasks.flatMap(x => x.parameters);

  const schema: Record<string, any> = {
    title: raw.description ?? raw.type,
    properties: {},
    required: [],
  };

  const uiSchema: Record<string, any> = {};

  for (const { key, type, description, optional } of parameters) {
    const required = !optional;

    schema.properties[key] = {
      title: key,
      ...getJsonSchemaType(type),
    };

    uiSchema[key] = {
      ...getUiSchema(type),
      'ui:help': description,
    };

    if (required) {
      schema.required.push(key);
    }
  }

  return { value: { schema, uiSchema }, loading: false, error: undefined };
}
