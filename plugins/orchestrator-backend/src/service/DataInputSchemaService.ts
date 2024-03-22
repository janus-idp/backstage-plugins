import { JsonObject } from '@backstage/types';

import { JSONSchema7 } from 'json-schema';

import {
  ComposedSchema,
  isComposedSchema,
  isJsonObjectSchema,
  JsonObjectSchema,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowInputSchemaResponse,
  WorkflowInputSchemaStep,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { WORKFLOW_DATA_KEY } from './constants';

const SINGLE_SCHEMA_TITLE = 'workflow input data';
const SINGLE_SCHEMA_KEY = 'DUMMY_KEY_FOR_SINGLE_SCHEMA';

export class DataInputSchemaService {
  public extractInitialStateFromWorkflowData(
    workflowData: JsonObject,
    schemaProperties: JsonObjectSchema['properties'],
  ): JsonObject {
    return Object.keys(schemaProperties)
      .filter(k => k in workflowData)
      .reduce((result, k) => {
        if (!workflowData[k]) {
          return result;
        }
        result[k] = workflowData[k];
        return result;
      }, {} as JsonObject);
  }

  private findReferencedSchema(
    rootSchema: JSONSchema7,
    ref: string,
  ): JSONSchema7 {
    const pathParts = ref.split('/').filter(part => !['#', ''].includes(part));

    let current: any = rootSchema;
    for (const part of pathParts) {
      current = current?.[part];
      if (current === undefined) {
        throw new Error(`schema contains invalid ref ${ref}`);
      }
    }
    return current;
  }

  public resolveRefs(schema: JsonObjectSchema): JsonObjectSchema {
    const resolvedSchemaProperties = Object.entries(schema.properties).reduce<
      JsonObjectSchema['properties']
    >(
      (prev, [key, curSchema]) => ({
        ...prev,
        [key]: curSchema.$ref
          ? this.findReferencedSchema(schema, curSchema.$ref)
          : curSchema,
      }),
      {},
    );
    return {
      ...schema,
      properties: resolvedSchemaProperties,
    };
  }

  private getInputSchemaSteps(
    schema: ComposedSchema,
    isAssessment: boolean,
    workflowData?: JsonObject,
  ): WorkflowInputSchemaStep[] {
    return Object.entries(schema.properties).map(([key, curSchema]) => {
      const data = (workflowData?.[key] as JsonObject) ?? {};
      return {
        title: curSchema.title || key,
        key,
        schema: curSchema,
        data,
        readonlyKeys: isAssessment ? Object.keys(data) : [],
      };
    });
  }

  public getWorkflowInputSchemaResponse(
    definition: WorkflowDefinition,
    inputSchema: JSONSchema7,
    instanceVariables?: ProcessInstanceVariables,
    assessmentInstanceVariables?: ProcessInstanceVariables,
  ): WorkflowInputSchemaResponse {
    const variables = instanceVariables ?? assessmentInstanceVariables;
    const isAssessment = !!assessmentInstanceVariables;
    const workflowData = variables
      ? (variables[WORKFLOW_DATA_KEY] as JsonObject)
      : undefined;

    const res: WorkflowInputSchemaResponse = {
      definition,
      isComposedSchema: false,
      schemaSteps: [],
    };
    if (!isJsonObjectSchema(inputSchema)) {
      return {
        ...res,
        schemaParseError:
          'the provided schema does not contain valid properties',
      };
    }
    try {
      const resolvedSchema = this.resolveRefs(inputSchema);

      if (isComposedSchema(resolvedSchema)) {
        res.schemaSteps = this.getInputSchemaSteps(
          resolvedSchema,
          isAssessment,
          workflowData,
        );
        res.isComposedSchema = true;
      } else {
        const data = workflowData
          ? this.extractInitialStateFromWorkflowData(
              workflowData,
              resolvedSchema.properties,
            )
          : {};
        res.schemaSteps = [
          {
            schema: resolvedSchema,
            title: resolvedSchema.title ?? SINGLE_SCHEMA_TITLE,
            key: SINGLE_SCHEMA_KEY,
            data,
            readonlyKeys: isAssessment ? Object.keys(data) : [],
          },
        ];
      }
    } catch (err) {
      res.schemaParseError =
        typeof err === 'object' && (err as { message: string }).message
          ? (err as { message: string }).message
          : 'unexpected parsing error';
    }
    return res;
  }
}
