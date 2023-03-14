import {
  GetDefinitionFilter,
  useGetWorkflowDefinition,
} from './useGetWorkflowDefinitions';
import {
  type WorkFlowTaskParameterType,
  workflowDefinitionSchema,
  type WorkflowDefinition,
} from '../models/workflowDefinitionSchema';
import { assert } from 'assert-ts';
import { FormSchema } from '../components/types';
import { type AsyncState } from 'react-use/lib/useAsync';
import lodashSet from 'lodash.set';
import lodashGet from 'lodash.get';
import { type UiSchema } from '@rjsf/core';
import type { JsonObject } from '@backstage/types';

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
        pattern: '^(https?)://', // TODO: better regex
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

export interface Step {
  uiSchema: UiSchema;
  mergedSchema: JsonObject;
  schema: JsonObject;
  title: string;
  description?: string;
}

export function jsonSchemaFromWorkflowDefinition(
  workflowDefinition: WorkflowDefinition,
): FormSchema {
  const result: FormSchema = {
    steps: [],
  };

  for (const task of workflowDefinition.tasks) {
    const schema: Record<string, any> = {
      type: 'object',
      title: task.name,
      properties: {},
      required: [],
    };

    const uiSchema: Record<string, any> = {};
    schema.required.push(task.name);
    lodashSet(schema, `properties.${task.name}`, {
      properties: {},
      required: [],
    });
    uiSchema[task.name] = {
      'ui:hidden': true,
    };

    for (const {
      key,
      type,
      description,
      optional,
      options = [],
    } of task.parameters) {
      const propertiesPath = `properties.${task.name}.properties.${key}`;
      const required = !optional;

      lodashSet(schema, propertiesPath, {
        title: `${key}`,
        ...getJsonSchemaType(type),
      });

      if (options.length > 0) {
        lodashSet(
          schema,
          `${propertiesPath}.enum`,
          options.map(option => option.key),
        );
        lodashSet(
          schema,
          `${propertiesPath}.enumNames`,
          options.map(option => option.value),
        );
      }

      const objectPath = `${task.name}.${key}`;

      lodashSet(uiSchema, objectPath, {
        ...getUiSchema(type),
        'ui:help': description,
        'ui:autocomplete': 'Off',
      });

      if (required) {
        const requiredPath = `properties.${task.name}.required`;
        const taskRequired = lodashGet(schema, requiredPath);
        taskRequired.push(key);
      }
    }
    result.steps.push({ schema, uiSchema });
  }

  return result;
}

export function useWorkflowDefinitionToJsonSchema(
  workflowDefinition: string,
  filterType: GetDefinitionFilter,
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
