import {
  GetDefinitionFilter,
  useGetWorkflowDefinition,
} from './useGetWorkflowDefinitions';
import {
  workflowDefinitionSchema,
  type WorkFlowTaskParameterType,
  type WorkflowDefinition,
  type WorkType,
} from '../models/workflowDefinitionSchema';
import { assert } from 'assert-ts';
import type { FormSchema, Step } from '../components/types';
import { type AsyncState } from 'react-use/lib/useAsync';
import set from 'lodash.set';
import get from 'lodash.get';
import { capitalize } from '../utils/string';

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

function transformWorkToStep(work: WorkType): Step {
  const title = work.name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(capitalize)
    .join(' '); // TODO: task label would be good here

  const schema: Record<string, any> = {
    type: 'object',
    title,
    properties: {},
    required: [],
  };

  const uiSchema: Record<string, any> = {};

  schema.required.push(work.name);

  set(schema, `properties.${work.name}`, {
    type: 'object',
    properties: {},
    required: [],
  });

  uiSchema[work.name] = {
    'ui:hidden': true,
  };

  for (const {
    key,
    type,
    description,
    optional,
    options = [],
  } of work.parameters) {
    const propertiesPath = `properties.${work.name}.properties.${key}`;
    const required = !optional;

    set(schema, propertiesPath, {
      title: `${key}`,
      ...getJsonSchemaType(type),
    });

    if (options.length > 0) {
      set(
        schema,
        `${propertiesPath}.enum`,
        options.map(option => option.key),
      );
      set(
        schema,
        `${propertiesPath}.enumNames`,
        options.map(option => option.value),
      );
    }

    const objectPath = `${work.name}.${key}`;

    set(uiSchema, objectPath, {
      ...getUiSchema(type),
      'ui:help': description,
      // 'ui:autocomplete': 'Off',
    });

    if (required) {
      const requiredPath = `properties.${work.name}.required`;
      const taskRequired = get(schema, requiredPath);
      taskRequired.push(key);
    }
  }

  return { schema, uiSchema, title, mergedSchema: schema };
}

export function jsonSchemaFromWorkflowDefinition(
  workflowDefinition: WorkflowDefinition,
): FormSchema {
  const result: FormSchema = {
    steps: [],
  };

  for (const work of workflowDefinition.works) {
    const step = transformWorkToStep(work);

    if (work.works && work.works.length > 0) {
      const key = Object.keys(step.schema)[0];

      set(step.schema, `properties.${key}.properties.works`, {
        type: 'array',
        title: `${step.title} works`,
        items: [],
      });

      set(step.uiSchema, `${key}.works.items`, []);

      for (const [index, childWork] of work.works.entries()) {
        const childStep = transformWorkToStep(childWork);

        set(
          step.schema,
          `properties.${key}.properties.works.items[${index}]`,
          childStep.schema,
        );

        set(step.uiSchema, `${key}.works.['ui:hidden']`, true);
        set(step.uiSchema, `${key}.works.items[${index}]`, childStep.uiSchema);
      }
    }

    result.steps.push(step);
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
