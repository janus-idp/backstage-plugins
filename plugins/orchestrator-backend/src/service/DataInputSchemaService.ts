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

import {
  WorkflowDataInputSchema,
  WorkflowDefinition,
} from '@janus-idp/backstage-plugin-orchestrator-common';

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

const JSON_SCHEMA_VERSION = 'http://json-schema.org/draft-04/schema#';
const FETCH_TEMPLATE_ACTION_OPERATION_ID = 'fetch:template';

const Regex = {
  VALUES_IN_SKELETON:
    /\{\{[%-]?\s*values\.(\w+)\s*[%-]?}}|\{%-?\s*if\s*values\.(\w+)\s*(?:%-?})?/gi,
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

  public async generate(args: {
    definition: WorkflowDefinition;
    openApi: OpenAPIV3.Document;
  }): Promise<ComposedJsonSchema | null> {
    const workflow = args.definition as Specification.Workflow;

    if (!workflow.states.length) {
      this.logger.info(`No state found on workflow. Skipping...`);
      return null;
    }

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
        if (!dataConditions?.length) {
          continue;
        }

        const conditionalStateNames = dataConditions
          .filter(d => (d as Transitiondatacondition).transition)
          .map(d => {
            const transition = (d as Transitiondatacondition).transition;
            if (typeof transition === 'string') {
              return transition;
            }
            return transition.nextState;
          });

        const conditionalStates = workflow.states.filter(s =>
          conditionalStateNames.includes(s.name!),
        );

        const conditionalActionSchemas: JsonSchemaFile[] = [];
        for (const conditionalState of conditionalStates) {
          stateHandled.add(conditionalState.name!);

          for (const actionDescriptor of this.extractActionsFromState(
            conditionalState,
          )) {
            const result = await this.extractSchemaFromState({
              workflow: workflow,
              openApi: args.openApi,
              actionDescriptor,
              workflowArgsMap,
              isConditional: true,
            });

            if (!result) {
              continue;
            }

            conditionalActionSchemas.push(result.actionSchema);
          }
        }

        if (conditionalActionSchemas.length <= 1) {
          if (
            conditionalActionSchemas.length &&
            Object.keys(conditionalActionSchemas[0].jsonSchema.properties ?? {})
              .length
          ) {
            actionSchemas.push(conditionalActionSchemas[0]);
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
            ...(s.jsonSchema.required
              ? (s.jsonSchema.required as string[])
              : []),
          ],
        }));

        actionSchemas.push(oneOfSchema);
      } else {
        for (const actionDescriptor of this.extractActionsFromState(state)) {
          const result = await this.extractSchemaFromState({
            workflow,
            openApi: args.openApi,
            actionDescriptor,
            workflowArgsMap,
            isConditional: false,
          });

          if (!result) {
            continue;
          }

          const { actionSchema, argsMap } = result;

          argsMap.forEach((v, k) => {
            workflowArgsMap.set(k, v);
          });

          actionSchemas.push(actionSchema);
        }
      }
    }

    const workflowVariableSet = this.extractVariablesFromWorkflow(workflow);

    if (!actionSchemas.length && !workflowVariableSet.size) {
      return null;
    }

    if (workflowVariableSet.size) {
      const additionalInputTitle = 'Additional input data';
      const variableSetSchema = this.buildJsonSchemaSkeleton({
        owner: 'Workflow',
        workflowId: workflow.id,
        title: additionalInputTitle,
        filename: this.sanitizeText({
          text: additionalInputTitle,
          placeholder: '_',
        }),
      });

      Array.from(workflowVariableSet)
        .filter(v => !workflowArgsMap.get(v))
        .forEach(item => {
          variableSetSchema.jsonSchema.properties = {
            ...(variableSetSchema.jsonSchema.properties ?? {}),
            [item]: {
              title: item,
              type: 'string',
              description: 'Extracted from the Workflow definition',
            },
          };
        });

      if (Object.keys(variableSetSchema.jsonSchema.properties ?? {}).length) {
        actionSchemas.push(variableSetSchema);
      }
    }

    const compositionSchema = this.buildJsonSchemaSkeleton({
      workflowId: workflow.id,
      title: 'Data Input Schema',
    });

    actionSchemas.forEach(actionSchema => {
      compositionSchema.jsonSchema.properties = {
        ...(compositionSchema.jsonSchema.properties ?? {}),
        [`${actionSchema.fileName}`]: {
          $ref: actionSchema.fileName,
          type: actionSchema.jsonSchema.type,
          description: actionSchema.jsonSchema.description,
        },
      };
    });

    return { compositionSchema, actionSchemas };
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
    const functionRef = args.actionDescriptor.action
      .functionRef as Specification.Functionref;

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

    if (!functionRef.arguments) {
      return undefined;
    }

    const schemaPropsToFilter = { ...(refSchema.properties ?? {}) };
    const workflowArgsToFilter = {
      ...functionRef.arguments,
    } as WorkflowFunctionArgs;

    if (operationId === FETCH_TEMPLATE_ACTION_OPERATION_ID) {
      if (
        !workflowArgsToFilter.url ||
        !workflowArgsToFilter.values ||
        !Object.keys(workflowArgsToFilter.values).length
      ) {
        return undefined;
      }

      const githubPath = this.convertToGitHubApiUrl(workflowArgsToFilter.url);
      if (!githubPath) {
        return undefined;
      }

      const skeletonValues =
        await this.extractTemplateValuesFromSkeletonUrl(githubPath);

      if (!skeletonValues && !args.isConditional) {
        return undefined;
      }

      if (skeletonValues?.length) {
        const skeletonUrl = `https://github.com/${githubPath.owner}/${githubPath.repo}/tree/${githubPath.ref}/${githubPath.path}`;

        skeletonValues.forEach(v => {
          schemaPropsToFilter[v] = {
            title: v,
            description: `Extracted from ${skeletonUrl}`,
            type: 'string',
          };
          schemaPropsToFilter[this.snakeCaseToCamelCase(v)] = {
            title: this.snakeCaseToCamelCase(v),
            description: `Extracted from ${skeletonUrl}`,
            type: 'string',
          };
          schemaPropsToFilter[this.camelCaseToSnakeCase(v)] = {
            title: this.camelCaseToSnakeCase(v),
            description: `Extracted from ${skeletonUrl}`,
            type: 'string',
          };
        });
      }

      Object.keys(workflowArgsToFilter.values).forEach(k => {
        workflowArgsToFilter[k] = workflowArgsToFilter.values[k];
      });
    }

    if (refSchema.oneOf?.length) {
      const oneOfSchema = (refSchema.oneOf as OpenAPIV3.SchemaObject[]).find(
        item =>
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
      let argId;
      if (argsMap.has(argKey)) {
        if (argsMap.get(argKey) === argValue) {
          continue;
        }
        argId = this.sanitizeText({
          text: `${args.actionDescriptor.descriptor} ${argKey}`,
          placeholder: '_',
        });
      } else {
        argId = argKey;
      }
      argsMap.set(argId, argValue);

      filteredProperties[argId] = {
        ...schemaPropsToFilter[argKey],
      };
      filteredRequired.push(argKey);
    }

    const updatedSchema = {
      properties: Object.keys(filteredProperties).length
        ? { ...filteredProperties }
        : undefined,
      required: filteredRequired.length ? [...filteredRequired] : undefined,
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
    if (state.type === 'operation') {
      return this.extractActionsFromOperationState({ state });
    } else if (state.type === 'parallel') {
      return this.extractActionsFromParallelState({ state });
    } else if (state.type === 'foreach') {
      return this.extractActionsFromForeachState({ state });
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
    state: Specification.Operationstate;
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

  private extractActionsFromForeachState(args: {
    state: Specification.Foreachstate;
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
    const matchesInPath = githubPath.path.matchAll(Regex.VALUES_IN_SKELETON);
    const valuesInPath = Array.from(matchesInPath, match => match[1]);

    try {
      const content = await this.octokit.repos.getContent({ ...githubPath });
      if (!content) {
        return [];
      }
      const fileData = content.data as FileData;
      const fileContent = this.decoder.decode(
        new Uint8Array(Buffer.from(fileData.content, fileData.encoding)),
      );
      const matchesInContent = fileContent.matchAll(Regex.VALUES_IN_SKELETON);
      const valuesInContent = Array.from(
        matchesInContent,
        match => match[1] || match[2],
      );
      return [...valuesInPath, ...valuesInContent];
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
        const match = value.match(
          /(^|\s|\{)\s*\.([a-zA-Z_][a-zA-Z0-9_]*)\s*([=!<>]+)/,
        );
        addVariable({ variable: match?.[2], currentPath });
        const dotMatch = value.match(
          /(^|\s|\{)\s*\.(?![a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)([a-zA-Z_][a-zA-Z0-9_]*)/,
        );
        addVariable({ variable: dotMatch?.[2], currentPath });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          traverseValue(item, `${currentPath}[${index}]`);
        });
      } else if (typeof value === 'object') {
        traverseObject(value, currentPath);
      }
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

  public async resolveDataInputSchema(args: {
    openApi: OpenAPIV3.Document;
    workflowId: string;
  }): Promise<WorkflowDataInputSchema | undefined> {
    const requestBody =
      args.openApi.paths[`/${args.workflowId}`]?.post?.requestBody;
    if (!requestBody) {
      return undefined;
    }

    const content = (requestBody as OpenAPIV3.RequestBodyObject).content;
    if (!content) {
      return undefined;
    }

    const mainSchema = content[`application/json`]?.schema;
    if (!mainSchema) {
      return undefined;
    }

    const referencedSchemas = this.findReferencedSchemas({
      workflowId: args.workflowId,
      openApi: args.openApi,
      schema: mainSchema as OpenAPIV3.SchemaObject,
    });

    const compositionSchema = {
      ...mainSchema,
      title: '',
      properties: {
        ...referencedSchemas.reduce(
          (obj, s) => {
            obj![s.title!] = {
              $ref: `#/components/schemas/${s.title!}`,
            };
            return obj;
          },
          {} as WorkflowDataInputSchema['properties'],
        ),
      },
    };

    const dataInputSchema: WorkflowDataInputSchema = {
      ...compositionSchema,
      properties: referencedSchemas.reduce(
        (obj, s) => {
          obj![s.title!] = {
            $ref: `#/components/schemas/${s.title!}`,
          };
          return obj;
        },
        {} as WorkflowDataInputSchema['properties'],
      ),
      components: {
        schemas: referencedSchemas.reduce(
          (obj, s) => {
            obj[s.title!] = s as OpenAPIV3.NonArraySchemaObject;
            return obj;
          },
          {} as WorkflowDataInputSchema['components']['schemas'],
        ),
      },
    };

    return dataInputSchema;
  }

  private findReferencedSchemas(args: {
    workflowId: string;
    openApi: OpenAPIV3.Document;
    schema: JSONSchema4;
  }): JSONSchema4[] {
    if (!args.schema.properties) {
      return [];
    }

    const schemas: JSONSchema4[] = [];

    for (const key of Object.keys(args.schema.properties)) {
      const property = args.schema.properties[key];
      if (!property.$ref) {
        continue;
      }
      const referencedSchema = this.findReferencedSchema({
        rootSchema: args.openApi,
        ref: property.$ref,
      });
      if (referencedSchema) {
        schemas.push({
          ...referencedSchema,
          title: referencedSchema
            .title!.replace(`${args.workflowId}:`, '')
            .trim(),
        });
      }
    }

    if (!schemas.length) {
      return [args.schema];
    }

    return schemas;
  }

  private findReferencedSchema(args: {
    rootSchema: JSONSchema4;
    ref: string;
  }): JSONSchema4 | undefined {
    const pathParts = args.ref
      .split('/')
      .filter(part => !['#', ''].includes(part));

    let current: JSONSchema4 | undefined = args.rootSchema;

    for (const part of pathParts) {
      current = current?.[part];
      if (current === undefined) {
        return undefined;
      }
    }

    return current;
  }
}
