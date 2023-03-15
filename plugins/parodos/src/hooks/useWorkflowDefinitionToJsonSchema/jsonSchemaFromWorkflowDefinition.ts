import {
  type WorkFlowTaskParameterType,
  type WorkflowDefinition,
  type WorkType,
} from '../../models/workflowDefinitionSchema';
import type { FormSchema, Step } from '../../components/types';
import set from 'lodash.set';
import get from 'lodash.get';
import { capitalize } from '../../utils/string';

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

function buildWorksTree(
  work: WorkType,
  {
    schema,
    uiSchema,
    title,
  }: {
    schema: Record<string, any>;
    uiSchema: Record<string, any>;
    title: string;
  },
): void {
  const key = Object.keys(schema)[0];

  set(schema, `properties.${key}.properties.works`, {
    type: 'array',
    title: `${title} works`,
    items: [],
  });

  set(uiSchema, `${key}.works.items`, []);

  const works = work.works ?? [];

  for (const [index, childWork] of works.entries()) {
    const childStep = transformWorkToStep(childWork);

    const nextSchemaKey = `properties.${key}.properties.works.items[${index}]`;
    const nextUiSchemaKey = `${key}.works.items[${index}]`;

    set(schema, nextSchemaKey, childStep.schema);

    set(uiSchema, `${key}.works.['ui:hidden']`, true);
    set(uiSchema, nextUiSchemaKey, childStep.uiSchema);

    const childWorks = childWork.works ?? [];

    if (childWorks.length > 0) {
      for (const nextChildWork of childWorks) {
        buildWorksTree(nextChildWork, {
          schema: get(schema, nextSchemaKey),
          uiSchema: get(uiSchema, nextUiSchemaKey),
          title: get(schema, `${nextSchemaKey}.title`),
        });
      }
    }
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

  const works = work.works ?? [];

  if (works.length > 0) {
    buildWorksTree(work, { schema, uiSchema, title });
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

    result.steps.push(step);
  }

  return result;
}
