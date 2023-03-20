import {
  type WorkFlowTaskParameterType,
  type WorkflowDefinition,
  type WorkType,
} from '../../models/workflowDefinitionSchema';
import type { FormSchema, Step } from '../../components/types';
import set from 'lodash.set';
import get from 'lodash.get';
import { taskDisplayName } from '../../utils/string';

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
    case 'URL':
      return {
        type: 'string',
        pattern: '^(https?)://', // TODO: better regex
      };
    case 'BOOLEAN': {
      return {
        type: 'boolean'
      }
    }
    case 'MOCK-SELECT':
      return {};
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
    case 'BOOLEAN': {
      return {
        // TODO: what if needs to be a checkbox list?
        'ui:widget': 'radio'
      }
    }
    case 'URL':
    case 'NUMBER':
      return {};
    default:
      return {};
  }
}

function transformWorkToStep(work: WorkType): Step {
  const title = taskDisplayName(work.name); // TODO: task label would be good here

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
    default: fieldDefault,
    options = [],
  } of work.parameters ?? []) {
    const propertiesPath = `properties.${work.name}.properties.${key}`;
    const required = !optional;

    set(schema, propertiesPath, {
      title: `${key}`,
      ...getJsonSchemaType(type),
      ...{default: fieldDefault}
    });

    if (options && options.length > 0) {
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
      'ui:autocomplete': 'Off',
    });

    if (required) {
      const requiredPath = `properties.${work.name}.required`;
      const taskRequired = get(schema, requiredPath);
      taskRequired.push(key);
    }
  }

  const works = work.works ?? [];

  if (works.length > 0) {
    const key = Object.keys(schema.properties)[0];

    set(schema, `properties.${key}.properties.works`, {
      type: 'array',
      title: `${title} works`,
      items: [],
    });

    set(uiSchema, `${key}.works.items`, []);

    const childWorks = work.works ?? [];

    for (const [index, childWork] of childWorks.entries()) {
      const childStep = transformWorkToStep(childWork);

      const nextSchemaKey = `properties.${key}.properties.works.items[${index}]`;
      const nextUiSchemaKey = `${key}.works.items[${index}]`;

      set(schema, nextSchemaKey, childStep.schema);

      set(uiSchema, `${key}.works.['ui:hidden']`, true);
      set(uiSchema, nextUiSchemaKey, childStep.uiSchema);
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

  const parameters = workflowDefinition.parameters ?? [];

  if (parameters.length > 0) {
    const step = transformWorkToStep({
      name: workflowDefinition.name,
      parameters: [...parameters],
    } as WorkType);

    result.steps.push(step);
  }

  for (const work of workflowDefinition.works) {
    const step = transformWorkToStep(work);

    result.steps.push(step);
  }

  return result;
}
