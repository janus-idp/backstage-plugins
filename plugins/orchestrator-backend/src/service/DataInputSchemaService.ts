import { Octokit } from '@octokit/rest';
import { Specification } from '@severlessworkflow/sdk-typescript';
import { Callbackstate } from '@severlessworkflow/sdk-typescript/lib/definitions/callbackstate';
import { Databasedswitchstate } from '@severlessworkflow/sdk-typescript/lib/definitions/databasedswitchstate';
import { Eventstate } from '@severlessworkflow/sdk-typescript/lib/definitions/eventstate';
import { Foreachstate } from '@severlessworkflow/sdk-typescript/lib/definitions/foreachstate';
import { Injectstate } from '@severlessworkflow/sdk-typescript/lib/definitions/injectstate';
import { Operationstate } from '@severlessworkflow/sdk-typescript/lib/definitions/operationstate';
import { Parallelstate } from '@severlessworkflow/sdk-typescript/lib/definitions/parallelstate';
import { Sleepstate } from '@severlessworkflow/sdk-typescript/lib/definitions/sleepstate';
import { Transitiondatacondition } from '@severlessworkflow/sdk-typescript/lib/definitions/transitiondatacondition';
import { Switchstate } from '@severlessworkflow/sdk-typescript/lib/definitions/types';
import { JSONSchema4 } from 'json-schema';
import { OpenAPIV3 } from 'openapi-types';
import { Logger } from 'winston';

import { WorkflowDefinition } from '@janus-idp/backstage-plugin-orchestrator-common';

type OpenApiSchemaProperties = {
  [k: string]: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
};

interface WorkflowFunctionArgs {
  [x: string]: any;
}

interface WorkflowActionDescriptor {
  owner: string;
  descriptor: string;
  action: Specification.Action;
}

type WorkflowState =
  | Sleepstate
  | Eventstate
  | Operationstate
  | Parallelstate
  | Switchstate
  | Injectstate
  | Foreachstate
  | Callbackstate;

interface GitHubPath {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}

interface GitTreeItem {
  path: string;
  type: 'blob' | 'tree';
}

interface FileData {
  content: string;
  encoding: BufferEncoding;
}

interface JsonSchemaFile {
  owner: string;
  fileName: string;
  jsonSchema: JSONSchema4;
}

interface ComposedJsonSchema {
  compositionSchema: JsonSchemaFile;
  actionSchemas: JsonSchemaFile[];
}

interface ScaffolderTemplate {
  url: string;
  values: string[];
}

interface WorkflowFunction {
  operationId: string;
  ref: Specification.Functionref;
  schema: OpenAPIV3.SchemaObject;
}

const JSON_SCHEMA_VERSION = 'http://json-schema.org/draft-04/schema#';
const FETCH_TEMPLATE_ACTION_OPERATION_ID = 'fetch:template';

const Regex = {
  VALUES_IN_SKELETON: /\{\{[%-]?\s*values\.(\w+)\s*[%-]?}}/gi,
  CONDITION_IN_SKELETON: /\{%-?\s*if\s*values\.(\w+)\s*(?:%-?})?/gi,
  GITHUB_URL:
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:tree|blob)\/([^/]+)\/(.+)$/,
  GITHUB_API_URL:
    /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/contents\/(.+)\?ref=(.+)$/,
  NAIVE_ARG_IN_JQ: /^\$\{[^}]*}$|^(\.[^\s.{]+)(?!\.)$/,
  NON_ALPHA_NUMERIC: /[^a-zA-Z0-9]+/g,
  SNAKE_CASE: /_([a-z])/g,
  CAMEL_CASE: /([A-Z])/g,
} as const;

export class DataInputSchemaService {
  private readonly octokit: Octokit;
  private readonly decoder = new TextDecoder('utf-8');

  constructor(
    private readonly logger: Logger,
    githubToken: string | undefined,
  ) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  private resolveObject<T>(obj: T | undefined): T {
    return { ...(obj ?? {}) } as T;
  }

  private resolveAnyToArray<T>(value: any): T[] {
    if (Array.isArray(value)) {
      return this.resolveArray(value);
    }
    return [];
  }

  private resolveArray<T>(arr: T[] | undefined): T[] {
    return [...(arr ?? [])] as T[];
  }

  private resolveObjectIfNotEmpty<T>(obj: T | undefined): T | undefined {
    return Object.keys(obj ?? {}).length ? obj : undefined;
  }

  private resolveArrayIfNotEmpty<T>(arr: T[]): T[] | undefined {
    return arr.length ? arr : undefined;
  }

  private resolveTransitionName(d: Transitiondatacondition): string {
    return typeof d.transition === 'string'
      ? d.transition
      : d.transition.nextState;
  }

  private resolveSingleConditionalSchema(
    conditionalActionSchemas: JsonSchemaFile[],
  ): JsonSchemaFile | undefined {
    if (
      conditionalActionSchemas.length === 1 &&
      this.resolveObjectIfNotEmpty(
        conditionalActionSchemas[0].jsonSchema.properties,
      )
    ) {
      return conditionalActionSchemas[0];
    }
    return undefined;
  }

  public async generate(args: {
    definition: WorkflowDefinition;
    openApi: OpenAPIV3.Document;
  }): Promise<ComposedJsonSchema | null> {
    const workflow = args.definition as Specification.Workflow;

    const actionSchemas: JsonSchemaFile[] = [];
    const workflowArgsMap = new Map<string, string>();

    const stateHandled = new Set<string>();

    for (const state of workflow.states) {
      if (stateHandled.has(state.name!)) {
        continue;
      }

      stateHandled.add(state.name!);

      if (state.type === 'switch') {
        const dataConditions = (state as Databasedswitchstate).dataConditions;

        const conditionalStateNames = dataConditions
          ?.filter(d => (d as Transitiondatacondition).transition)
          .map(d => this.resolveTransitionName(d as Transitiondatacondition));

        const conditionalStates = workflow.states.filter(s =>
          conditionalStateNames.includes(s.name!),
        );

        const { conditionalActionSchemas, conditionalStatesHandled } =
          await this.extractConditionalSchemas({
            workflow,
            openApi: args.openApi,
            conditionalStates,
            workflowArgsMap,
          });

        conditionalStatesHandled.forEach(s => stateHandled.add(s));

        if (conditionalActionSchemas.length <= 1) {
          const singleConditionalSchema = this.resolveSingleConditionalSchema(
            conditionalActionSchemas,
          );

          if (singleConditionalSchema) {
            actionSchemas.push(singleConditionalSchema);
          }

          continue;
        }

        const conditionalDescriptor = this.buildActionDescriptor({
          stateName: state.name,
        });
        const oneOfSchema = this.buildJsonSchemaSkeleton({
          owner: state.name,
          workflowId: workflow.id,
          title: conditionalDescriptor,
          filename: this.sanitizeText({
            text: conditionalDescriptor,
            placeholder: '_',
          }),
        });

        oneOfSchema.jsonSchema.oneOf = conditionalActionSchemas.map(s => ({
          title: s.owner,
          type: 'object',
          properties: {
            [s.owner]: { type: 'boolean', default: true },
            ...s.jsonSchema.properties,
          },
          required: [
            s.owner,
            ...this.resolveAnyToArray<string>(s.jsonSchema.required),
          ],
        }));

        actionSchemas.push(oneOfSchema);
      } else {
        const actionSchemasFromState = await this.extractSchemasFromStates({
          workflow: workflow,
          openApi: args.openApi,
          state,
          workflowArgsMap,
        });

        actionSchemas.push(...actionSchemasFromState);
      }
    }

    const variableSetSchema = this.extractAdditionalSchemaFromWorkflow({
      workflow,
      workflowArgsMap,
    });

    if (variableSetSchema) {
      actionSchemas.push(variableSetSchema);
    }

    if (!actionSchemas.length) {
      return null;
    }

    const compositionSchema = this.buildJsonSchemaSkeleton({
      workflowId: workflow.id,
      title: 'Data Input Schema',
    });

    actionSchemas.forEach(actionSchema => {
      compositionSchema.jsonSchema.properties = {
        ...this.resolveObject(compositionSchema.jsonSchema.properties),
        [`${actionSchema.fileName}`]: {
          $ref: actionSchema.fileName,
          type: actionSchema.jsonSchema.type,
          description: actionSchema.jsonSchema.description,
        },
      };
    });

    return { compositionSchema, actionSchemas };
  }

  private extractAdditionalSchemaFromWorkflow(args: {
    workflow: Specification.Workflow;
    workflowArgsMap: Map<string, string>;
  }): JsonSchemaFile | undefined {
    const workflowVariableSet = this.extractVariablesFromWorkflow(
      args.workflow,
    );
    if (!workflowVariableSet.size || !args.workflow.states.length) {
      return undefined;
    }

    const additionalInputTitle = 'Additional input data';
    const variableSetSchema = this.buildJsonSchemaSkeleton({
      owner: 'Workflow',
      workflowId: args.workflow.id,
      title: additionalInputTitle,
      filename: this.sanitizeText({
        text: additionalInputTitle,
        placeholder: '_',
      }),
    });

    Array.from(workflowVariableSet)
      .filter(v => !args.workflowArgsMap.get(v))
      .forEach(item => {
        variableSetSchema.jsonSchema.properties = {
          ...this.resolveObject(variableSetSchema.jsonSchema.properties),
          [item]: {
            title: item,
            type: 'string',
            description: 'Extracted from the Workflow definition',
          },
        };
      });

    if (
      !this.resolveObjectIfNotEmpty(variableSetSchema.jsonSchema.properties)
    ) {
      return undefined;
    }

    return variableSetSchema;
  }

  private async extractConditionalSchemas(args: {
    workflow: Specification.Workflow;
    openApi: OpenAPIV3.Document;
    conditionalStates: WorkflowState[];
    workflowArgsMap: Map<string, string>;
  }): Promise<{
    conditionalActionSchemas: JsonSchemaFile[];
    conditionalStatesHandled: Set<string>;
  }> {
    const conditionalActionSchemas: JsonSchemaFile[] = [];
    const conditionalStatesHandled = new Set<string>();

    for (const conditionalState of args.conditionalStates) {
      conditionalStatesHandled.add(conditionalState.name!);

      const conditionalSchemas = await this.extractConditionalSchemasFromState({
        workflow: args.workflow,
        openApi: args.openApi,
        conditionalState,
        workflowArgsMap: args.workflowArgsMap,
      });

      conditionalActionSchemas.push(...conditionalSchemas);
    }

    return { conditionalActionSchemas, conditionalStatesHandled };
  }

  private async extractConditionalSchemasFromState(args: {
    workflow: Specification.Workflow;
    openApi: OpenAPIV3.Document;
    conditionalState: WorkflowState;
    workflowArgsMap: Map<string, string>;
  }): Promise<JsonSchemaFile[]> {
    const schemas: JsonSchemaFile[] = [];

    const actions = this.extractActionsFromState(args.conditionalState);

    for (const actionDescriptor of actions) {
      const result = await this.extractSchemaFromState({
        workflow: args.workflow,
        openApi: args.openApi,
        actionDescriptor,
        workflowArgsMap: args.workflowArgsMap,
        isConditional: true,
      });

      if (!result) {
        continue;
      }

      schemas.push(result.actionSchema);
    }

    return schemas;
  }

  private async extractTemplateFromSkeletonUrl(args: {
    url: string;
    isConditional: boolean;
  }): Promise<ScaffolderTemplate | undefined> {
    const githubPath = this.convertToGitHubApiUrl(args.url);
    if (!githubPath) {
      return undefined;
    }

    const skeletonValues =
      await this.extractTemplateValuesFromSkeletonUrl(githubPath);

    if (!skeletonValues && !args.isConditional) {
      return undefined;
    }

    const fixedSkeletonUrl = `https://github.com/${githubPath.owner}/${githubPath.repo}/tree/${githubPath.ref}/${githubPath.path}`;
    return {
      values: skeletonValues,
      url: fixedSkeletonUrl,
    };
  }

  private async extractSchemasFromStates(args: {
    workflow: Specification.Workflow;
    openApi: OpenAPIV3.Document;
    state: WorkflowState;
    workflowArgsMap: Map<string, string>;
  }): Promise<JsonSchemaFile[]> {
    const schemas: JsonSchemaFile[] = [];
    for (const actionDescriptor of this.extractActionsFromState(args.state)) {
      const result = await this.extractSchemaFromState({
        workflow: args.workflow,
        openApi: args.openApi,
        actionDescriptor,
        workflowArgsMap: args.workflowArgsMap,
        isConditional: false,
      });

      if (!result) {
        continue;
      }

      const { actionSchema, argsMap } = result;

      argsMap.forEach((v, k) => {
        args.workflowArgsMap.set(k, v);
      });

      schemas.push(actionSchema);
    }
    return schemas;
  }

  private isValidTemplateAction(
    workflowArgsToFilter: WorkflowFunctionArgs,
  ): boolean {
    return (
      workflowArgsToFilter.url &&
      workflowArgsToFilter.values &&
      Object.keys(workflowArgsToFilter.values).length
    );
  }

  private extractFilteredArgId(args: {
    map: Map<string, string>;
    key: string;
    value: string;
    description: string;
  }): string | undefined {
    if (args.map.has(args.key)) {
      if (args.map.get(args.key) === args.value) {
        return undefined;
      }
      return this.sanitizeText({
        text: `${args.description} ${args.key}`,
        placeholder: '_',
      });
    }
    return args.key;
  }

  private extractWorkflowFunction(args: {
    workflow: Specification.Workflow;
    actionDescriptor: WorkflowActionDescriptor;
    openApi: OpenAPIV3.Document;
  }): WorkflowFunction | undefined {
    const functionRef = args.actionDescriptor.action
      .functionRef as Specification.Functionref;

    if (!functionRef.arguments) {
      this.logger.info(
        `No arguments found for function ${functionRef.refName}. Skipping...`,
      );
      return undefined;
    }

    const operationId = this.extractOperationIdByWorkflowFunctionName({
      workflow: args.workflow,
      functionName: functionRef.refName,
    });

    if (!operationId) {
      this.logger.info(
        `No operation id found for function ${functionRef.refName}. Skipping...`,
      );
      return undefined;
    }

    const refSchema = this.extractSchemaByOperationId({
      openApi: args.openApi,
      operationId,
    });

    if (!refSchema) {
      this.logger.info(
        `The schema associated with ${operationId} could not be found. Skipping...`,
      );
      return undefined;
    }

    return {
      operationId,
      ref: functionRef,
      schema: refSchema,
    };
  }

  private async extractSchemaFromState(args: {
    workflow: Specification.Workflow;
    openApi: OpenAPIV3.Document;
    actionDescriptor: WorkflowActionDescriptor;
    workflowArgsMap: Map<string, string>;
    isConditional: boolean;
  }): Promise<
    { actionSchema: JsonSchemaFile; argsMap: Map<string, string> } | undefined
  > {
    const wfFunction = this.extractWorkflowFunction({
      workflow: args.workflow,
      actionDescriptor: args.actionDescriptor,
      openApi: args.openApi,
    });
    if (!wfFunction) {
      return undefined;
    }

    const schemaPropsToFilter = this.resolveObject(
      wfFunction.schema.properties,
    );
    const workflowArgsToFilter = {
      ...wfFunction.ref.arguments,
    } as WorkflowFunctionArgs;

    if (wfFunction.operationId === FETCH_TEMPLATE_ACTION_OPERATION_ID) {
      if (!this.isValidTemplateAction(workflowArgsToFilter)) {
        return undefined;
      }

      const template = await this.extractTemplateFromSkeletonUrl({
        url: workflowArgsToFilter.url,
        isConditional: args.isConditional,
      });

      template?.values.forEach(v => {
        schemaPropsToFilter[v] = {
          title: v,
          description: `Extracted from ${template.url}`,
          type: 'string',
        };
        schemaPropsToFilter[this.snakeCaseToCamelCase(v)] = {
          title: this.snakeCaseToCamelCase(v),
          description: `Extracted from ${template.url}`,
          type: 'string',
        };
        schemaPropsToFilter[this.camelCaseToSnakeCase(v)] = {
          title: this.camelCaseToSnakeCase(v),
          description: `Extracted from ${template.url}`,
          type: 'string',
        };
      });

      Object.keys(workflowArgsToFilter.values).forEach(k => {
        workflowArgsToFilter[k] = workflowArgsToFilter.values[k];
      });
    }

    if (wfFunction.schema.oneOf?.length) {
      const oneOfSchema = (
        wfFunction.schema.oneOf as OpenAPIV3.SchemaObject[]
      ).find(item =>
        Object.keys(workflowArgsToFilter).some(arg =>
          Object.keys(item.properties!).includes(arg),
        ),
      );
      if (!oneOfSchema?.properties) {
        return undefined;
      }
      Object.entries(oneOfSchema.properties).forEach(([k, v]) => {
        schemaPropsToFilter[k] = {
          ...(v as OpenAPIV3.BaseSchemaObject),
        };
      });
    }

    const requiredArgsToShow =
      this.extractRequiredArgsToShow(workflowArgsToFilter);
    if (!Object.keys(requiredArgsToShow).length) {
      return undefined;
    }

    const argsMap = new Map(args.workflowArgsMap);
    const filteredProperties: OpenApiSchemaProperties = {};
    const filteredRequired: string[] = [];
    for (const [argKey, argValue] of Object.entries(requiredArgsToShow)) {
      if (!schemaPropsToFilter.hasOwnProperty(argKey)) {
        continue;
      }
      const argId = this.extractFilteredArgId({
        map: argsMap,
        key: argKey,
        value: argValue,
        description: args.actionDescriptor.descriptor,
      });
      if (!argId) {
        continue;
      }
      argsMap.set(argId, argValue);

      filteredProperties[argId] = {
        ...schemaPropsToFilter[argKey],
      };
      filteredRequired.push(argKey);
    }

    const updatedSchema = {
      properties: this.resolveObjectIfNotEmpty(filteredProperties),
      required: this.resolveArrayIfNotEmpty(filteredRequired),
    };

    if (!updatedSchema.properties && !args.isConditional) {
      return undefined;
    }

    const actionSchema = this.buildJsonSchemaSkeleton({
      owner: args.actionDescriptor.owner,
      workflowId: args.workflow.id,
      title: args.actionDescriptor.descriptor,
      filename: this.sanitizeText({
        text: args.actionDescriptor.descriptor,
        placeholder: '_',
      }),
    });

    actionSchema.jsonSchema = {
      ...actionSchema.jsonSchema,
      ...updatedSchema,
    };

    return { actionSchema, argsMap };
  }

  private extractRequiredArgsToShow(
    argsToFilter: WorkflowFunctionArgs,
  ): WorkflowFunctionArgs {
    return Object.entries(argsToFilter).reduce((obj, [k, v]) => {
      if (
        typeof v === 'string' &&
        Regex.NAIVE_ARG_IN_JQ.test(String(v.trim()))
      ) {
        obj[k] = v;
      }
      return obj;
    }, {} as WorkflowFunctionArgs);
  }

  private extractSchemaByOperationId(args: {
    openApi: OpenAPIV3.Document;
    operationId: string;
  }): OpenAPIV3.SchemaObject | undefined {
    const openApiOperation = this.extractOperationFromOpenApi({
      openApi: args.openApi,
      operationId: args.operationId,
    });
    if (!openApiOperation?.requestBody) {
      this.logger.info(
        `The operation associated with ${args.operationId} has no requestBody.`,
      );
      return undefined;
    }

    const requestBodyContent = (
      openApiOperation.requestBody as OpenAPIV3.RequestBodyObject
    ).content;
    if (!requestBodyContent) {
      this.logger.info(
        `The request body associated with ${args.operationId} has no content.`,
      );
      return undefined;
    }

    const bodyContent = Object.values(requestBodyContent).pop();
    if (!bodyContent?.schema) {
      this.logger.info(
        `The body content associated with ${args.operationId} has no schema.`,
      );
      return undefined;
    }

    const $ref = (bodyContent.schema as OpenAPIV3.ReferenceObject).$ref;
    if (!$ref) {
      this.logger.info(
        `The schema associated with ${args.operationId} has no $ref.`,
      );
      return undefined;
    }

    const refParts = $ref.split('/');
    const refKey = refParts[refParts.length - 1];
    return args.openApi.components?.schemas?.[refKey] as OpenAPIV3.SchemaObject;
  }

  private extractActionsFromState(
    state: WorkflowState,
  ): WorkflowActionDescriptor[] {
    if (state.type === 'operation' || state.type === 'foreach') {
      return this.extractActionsFromOperationState({ state });
    } else if (state.type === 'parallel') {
      return this.extractActionsFromParallelState({ state });
    } else if (state.type === 'event') {
      return this.extractActionsFromEventState({ state });
    } else if (state.type === 'callback') {
      return this.extractActionsFromCallbackState({ state });
    }
    return [];
  }

  private buildActionDescriptor(args: {
    actionName?: string;
    stateName: string;
    functionRefName?: string;
    outerItem?: { name: string } & (
      | { kind: 'Unique' }
      | {
          kind: 'Array';
          array: Specification.Onevents[] | Specification.Branch[];
          idx: number;
        }
    );
    actions?: {
      array: Specification.Action[];
      idx: number;
    };
  }): string {
    const separator = ' > ';
    let descriptor = args.stateName;
    if (args.outerItem) {
      if (args.outerItem.kind === 'Unique') {
        descriptor += `${separator}${args.outerItem.name}`;
      } else if (args.outerItem.array.length > 1) {
        descriptor += `${separator}${args.outerItem.name}-${
          args.outerItem.idx + 1
        }`;
      }
    }
    if (args.actionName) {
      descriptor += `${separator}${args.actionName}`;
    }
    if (args.functionRefName) {
      descriptor += `${separator}${args.functionRefName}`;
    }
    if (!args.actionName && args.actions && args.actions.array.length > 1) {
      descriptor += `${separator}${args.actions.idx + 1}`;
    }
    return descriptor;
  }

  private extractActionsFromOperationState(args: {
    state: Specification.Operationstate | Specification.Foreachstate;
    functionRefName?: string;
  }): WorkflowActionDescriptor[] {
    if (!args.state.actions) {
      return [];
    }
    return args.state.actions
      .filter(action => {
        if (!action.functionRef || typeof action.functionRef === 'string') {
          return false;
        }
        if (!args.functionRefName) {
          return true;
        }
        return action.functionRef.refName === args.functionRefName;
      })
      .map<WorkflowActionDescriptor>((action, idx, arr) => {
        const descriptor = this.buildActionDescriptor({
          actionName: action.name,
          stateName: args.state.name!,
          functionRefName: (action.functionRef as Specification.Functionref)!
            .refName,
          actions: {
            array: arr,
            idx,
          },
        });
        return { owner: args.state.name!, descriptor, action };
      });
  }

  private extractActionsFromParallelState(args: {
    state: Specification.Parallelstate;
    functionRefName?: string;
  }): WorkflowActionDescriptor[] {
    if (!args.state.branches) {
      return [];
    }

    return args.state.branches
      .map(branch =>
        branch.actions
          .filter(action => {
            if (!action.functionRef || typeof action.functionRef === 'string') {
              return false;
            }
            if (!args.functionRefName) {
              return true;
            }
            return action.functionRef.refName === args.functionRefName;
          })
          .map<WorkflowActionDescriptor>((action, idx, arr) => {
            const descriptor = this.buildActionDescriptor({
              actionName: action.name,
              outerItem: {
                kind: 'Unique',
                name: branch.name,
              },
              stateName: args.state.name!,
              functionRefName:
                (action.functionRef as Specification.Functionref)!.refName,
              actions: {
                array: arr,
                idx,
              },
            });
            return { owner: args.state.name!, descriptor, action };
          }),
      )
      .flat();
  }

  private extractActionsFromEventState(args: {
    state: Specification.Eventstate;
    functionRefName?: string;
  }): WorkflowActionDescriptor[] {
    if (!args.state.onEvents) {
      return [];
    }

    return args.state.onEvents
      .map((onEvent, eIdx, eArr) => {
        if (!onEvent.actions) {
          return [];
        }
        return onEvent.actions
          .filter(action => {
            if (!action.functionRef || typeof action.functionRef === 'string') {
              return false;
            }
            if (!args.functionRefName) {
              return true;
            }
            return action.functionRef.refName === args.functionRefName;
          })
          .map<WorkflowActionDescriptor>((action, aIdx, aArr) => {
            const descriptor = this.buildActionDescriptor({
              actionName: action.name,
              stateName: args.state.name,
              functionRefName:
                (action.functionRef as Specification.Functionref)!.refName,
              actions: {
                array: aArr,
                idx: aIdx,
              },
              outerItem: {
                kind: 'Array',
                name: 'onEvent',
                array: eArr,
                idx: eIdx,
              },
            });
            return { owner: args.state.name, descriptor, action };
          });
      })
      .flat();
  }

  private extractActionsFromCallbackState(args: {
    state: Specification.Callbackstate;
    functionRefName?: string;
  }): WorkflowActionDescriptor[] {
    if (
      !args.state.action?.functionRef ||
      typeof args.state.action.functionRef === 'string' ||
      (args.functionRefName &&
        args.state.action.functionRef.refName !== args.functionRefName)
    ) {
      return [];
    }

    const descriptor = this.buildActionDescriptor({
      actionName: args.state.action.name,
      stateName: args.state.name!,
      functionRefName: args.state.action.functionRef.refName,
    });

    return [{ owner: args.state.name!, descriptor, action: args.state.action }];
  }

  private snakeCaseToCamelCase(input: string): string {
    return input.replace(Regex.SNAKE_CASE, (_, letter) => letter.toUpperCase());
  }

  private camelCaseToSnakeCase(input: string): string {
    return input.replace(
      Regex.CAMEL_CASE,
      (_, letter) => `_${letter.toLowerCase()}`,
    );
  }

  private sanitizeText(args: { text: string; placeholder: string }): string {
    const parts = args.text.trim().split(Regex.NON_ALPHA_NUMERIC);
    return parts.join(args.placeholder);
  }

  private buildJsonSchemaSkeleton(args: {
    workflowId: string;
    title: string;
    owner?: string;
    filename?: string;
  }): JsonSchemaFile {
    const fullFileName = args.owner
      ? `${args.workflowId}__sub_schema__${args.filename}.json`
      : `${args.workflowId}__main_schema.json`;
    return {
      owner: args.owner ?? 'Workflow',
      fileName: fullFileName,
      jsonSchema: {
        title: `${args.workflowId}: ${args.title}`,
        $schema: JSON_SCHEMA_VERSION,
        type: 'object',
      },
    };
  }

  private extractOperationIdFromWorkflowFunction(
    workflowFunction: Specification.Function,
  ): string {
    return workflowFunction.operation.split('#')[1];
  }

  private extractOperationIdByWorkflowFunctionName(args: {
    workflow: Specification.Workflow;
    functionName: string;
  }): string | undefined {
    if (!Array.isArray(args.workflow.functions)) {
      return undefined;
    }

    const workflowFunction = args.workflow.functions.find(
      f => f.name === args.functionName,
    );

    if (!workflowFunction) {
      return undefined;
    }

    return this.extractOperationIdFromWorkflowFunction(workflowFunction);
  }

  private extractOperationFromOpenApi(args: {
    openApi: OpenAPIV3.Document;
    operationId: string;
  }): OpenAPIV3.OperationObject | undefined {
    return Object.values(args.openApi.paths)
      .flatMap(
        methods =>
          methods &&
          Object.values(methods).filter(
            method =>
              method &&
              (method as OpenAPIV3.OperationObject).operationId ===
                args.operationId,
          ),
      )
      .pop() as OpenAPIV3.OperationObject | undefined;
  }

  private removeTrailingSlash(path: string): string {
    if (path.endsWith('/')) {
      return path.slice(0, -1);
    }
    return path;
  }

  private removeSurroundingQuotes(inputString: string): string {
    const trimmed = inputString.trim();
    if (
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  private convertToGitHubApiUrl(githubUrl: string): GitHubPath | undefined {
    const sanitizedUrl = this.removeSurroundingQuotes(githubUrl);
    const githubApiMatch = RegExp(Regex.GITHUB_API_URL).exec(sanitizedUrl);
    if (githubApiMatch) {
      const [, owner, repo, ref, path] = githubApiMatch;
      return {
        owner,
        repo,
        ref,
        path: this.removeTrailingSlash(path),
      };
    }

    const githubUrlMatch = RegExp(Regex.GITHUB_URL).exec(sanitizedUrl);
    if (!githubUrlMatch) {
      return undefined;
    }

    const [, owner, repo, ref, path] = githubUrlMatch;
    return {
      owner,
      repo,
      ref,
      path: this.removeTrailingSlash(path),
    };
  }

  private async fetchGitHubRepoPaths(repoInfo: GitHubPath): Promise<string[]> {
    const response = await this.octokit.request(
      'GET /repos/:owner/:repo/git/trees/:ref',
      {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        ref: repoInfo.ref,
        recursive: 1,
      },
    );
    return response.data.tree
      .filter((item: GitTreeItem) => item.type === 'blob')
      .map((item: GitTreeItem) => item.path)
      .filter((path: string) => path.startsWith(`${repoInfo.path}/`));
  }

  private async extractTemplateValuesFromSkeletonUrl(
    githubPath: GitHubPath,
  ): Promise<string[]> {
    try {
      const filePaths = await this.fetchGitHubRepoPaths(githubPath);
      const fileMatchPromises: Promise<string[]>[] = [];

      filePaths.forEach(p => {
        fileMatchPromises.push(
          this.extractTemplateValuesFromGitHubFile({
            ...githubPath,
            path: p,
          }),
        );
      });

      const fileMatches = (await Promise.all(fileMatchPromises))
        .flat()
        .filter((r): r is string => r !== undefined);

      return Array.from(new Set(fileMatches));
    } catch (e) {
      this.logger.error(e);
    }
    return [];
  }

  private async extractTemplateValuesFromGitHubFile(
    githubPath: GitHubPath,
  ): Promise<string[]> {
    const valueMatchesInPath = githubPath.path.matchAll(
      Regex.VALUES_IN_SKELETON,
    );
    const conditionMatchesInPath = githubPath.path.matchAll(
      Regex.CONDITION_IN_SKELETON,
    );
    const valuesInPath = Array.from(valueMatchesInPath, match => match[1]);
    const conditionsInPath = Array.from(
      conditionMatchesInPath,
      match => match[1],
    );

    try {
      const content = await this.octokit.repos.getContent({ ...githubPath });
      if (!content) {
        return [];
      }
      const fileData = content.data as FileData;
      const fileContent = this.decoder.decode(
        new Uint8Array(Buffer.from(fileData.content, fileData.encoding)),
      );
      const valueMatchesInContent = fileContent.matchAll(
        Regex.VALUES_IN_SKELETON,
      );
      const conditionMatchesInContent = fileContent.matchAll(
        Regex.CONDITION_IN_SKELETON,
      );
      const valuesInContent = Array.from(
        valueMatchesInContent,
        match => match[1] || match[2],
      );
      const conditionsInContent = Array.from(
        conditionMatchesInContent,
        match => match[1],
      );

      return [
        ...valuesInPath,
        ...conditionsInPath,
        ...valuesInContent,
        ...conditionsInContent,
      ];
    } catch (e) {
      this.logger.error(e);
    }
    return [];
  }

  private extractVariablesFromWorkflow(
    workflow: Specification.Workflow,
  ): Set<string> {
    const blockList = [
      '.actionDataFilter',
      '.stateDataFilter',
      '.eventDataFilter',
    ];
    const inputVariableSet = new Set<string>();
    const workflowVariableSet = new Set<string>();

    function traverseValue(value: any, currentPath: string) {
      if (typeof value === 'string') {
        handleValue(value, currentPath);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          traverseValue(item, `${currentPath}[${index}]`);
        });
      } else if (typeof value === 'object') {
        traverseObject(value, currentPath);
      }
    }

    function handleValue(value: string, currentPath: string) {
      const tokens = value.split(/\s|\${|}/);
      let inTemplate = false;

      tokens.forEach(token => {
        if (inTemplate) {
          if (token.endsWith('}')) {
            inTemplate = false;
          }
          return;
        }

        if (token.startsWith('.')) {
          const variable = token.slice(1).replace(/[=!<>]{0,50}$/, '');
          if (variable && !variable.includes('.')) {
            addVariable({ variable, currentPath });
          }
        }

        if (token.startsWith('${')) {
          inTemplate = true;
        }
      });
    }

    function addVariable(args: {
      variable: string | undefined;
      currentPath: string;
    }): void {
      if (!args.variable) {
        return;
      }
      if (blockList.some(b => args.currentPath.includes(b))) {
        workflowVariableSet.add(args.variable);
      } else {
        inputVariableSet.add(args.variable);
      }
    }

    function traverseObject(currentObj: any, currentPath: string) {
      for (const key in currentObj) {
        if (currentObj.hasOwnProperty(key)) {
          const value = currentObj[key];
          const newPath = currentPath ? `${currentPath}.${key}` : key;

          traverseValue(value, newPath);
        }
      }
    }

    traverseObject(workflow, '');

    workflow.states.forEach(state => {
      if (state.type === 'inject' && state.data) {
        Object.keys(state.data).forEach(k => inputVariableSet.delete(k));
      }
    });

    workflowVariableSet.forEach(v => inputVariableSet.delete(v));

    return inputVariableSet;
  }
}
