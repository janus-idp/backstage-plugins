import { Config } from '@backstage/config';

import { OpenAPIV3 } from 'openapi-types';
import { Logger } from 'winston';

import {
  DEFAULT_SONATAFLOW_CONTAINER_IMAGE,
  DEFAULT_SONATAFLOW_PERSISTANCE_PATH,
  DEFAULT_WORKFLOWS_PATH,
  fromWorkflowSource,
  getWorkflowCategory,
  Job,
  ProcessInstance,
  ProcessInstanceStateValues,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowItem,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { spawn } from 'child_process';
import { join, resolve } from 'path';

import { executeWithRetry } from './Helper';

const SONATA_FLOW_RESOURCES_PATH =
  '/home/kogito/serverless-workflow-project/src/main/resources';

interface SonataFlowSource {
  uri: string;
}

interface LauncherCommand {
  command: string;
  args: string[];
}

interface SonataFlowConnectionConfig {
  host: string;
  port?: number;
  containerImage: string;
  resourcesPath: string;
  persistencePath: string;
  autoStart: boolean;
  jira?: JiraConfig;
}

interface JiraConfig {
  host: string;
  bearerToken: string;
}

export class SonataFlowService {
  private readonly connection: SonataFlowConnectionConfig;

  constructor(
    config: Config,
    private readonly logger: Logger,
  ) {
    this.connection = this.extractConnectionConfig(config);
  }

  public get autoStart(): boolean {
    return this.connection.autoStart;
  }

  public get url(): string {
    if (!this.connection.port) {
      return this.connection.host;
    }
    return `${this.connection.host}:${this.connection.port}`;
  }

  public get resourcesPath(): string {
    return this.connection.resourcesPath;
  }

  public async connect(): Promise<boolean> {
    const isAlreadyUp = await this.isSonataFlowUp(false);
    if (isAlreadyUp) {
      return true;
    }

    if (this.connection.autoStart) {
      this.launchSonataFlow();
      return await this.isSonataFlowUp(true);
    }

    return false;
  }

  public async fetchWorkflowUri(
    workflowId: string,
  ): Promise<string | undefined> {
    try {
      const urlToFetch = `${this.url}/management/processes/${workflowId}/sources`;
      const response = await executeWithRetry(() => fetch(urlToFetch));

      if (response.ok) {
        const json = (await response.json()) as SonataFlowSource[];
        // Assuming only one source in the list
        return json.pop()?.uri;
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching workflow uri: ${error}`);
    }

    return undefined;
  }

  public async fetchWorkflowInfo(
    workflowId: string,
  ): Promise<WorkflowInfo | undefined> {
    try {
      const urlToFetch = `${this.url}/management/processes/${workflowId}`;
      const response = await executeWithRetry(() => fetch(urlToFetch));

      if (response.ok) {
        return await response.json();
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching workflow info: ${error}`);
    }

    return undefined;
  }

  public async fetchWorkflowSource(
    workflowId: string,
  ): Promise<string | undefined> {
    try {
      const urlToFetch = `${this.url}/management/processes/${workflowId}/source`;
      const response = await executeWithRetry(() => fetch(urlToFetch));

      if (response.ok) {
        return await response.text();
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching workflow source: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflowDefinition(
    workflowId: string,
  ): Promise<WorkflowDefinition | undefined> {
    try {
      const source = await this.fetchWorkflowSource(workflowId);
      if (source) {
        return fromWorkflowSource(source);
      }
    } catch (error) {
      this.logger.error(`Error when fetching workflow definition: ${error}`);
    }
    return undefined;
  }

  public async fetchOpenApi(): Promise<OpenAPIV3.Document | undefined> {
    try {
      const urlToFetch = `${this.url}/q/openapi.json`;
      const response = await executeWithRetry(() => fetch(urlToFetch));
      if (response.ok) {
        return await response.json();
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching openapi: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflows(): Promise<WorkflowItem[] | undefined> {
    try {
      const urlToFetch = `${this.url}/management/processes`;
      const response = await executeWithRetry(() => fetch(urlToFetch));

      if (response.ok) {
        const workflowIds = (await response.json()) as string[];
        if (!workflowIds?.length) {
          return [];
        }
        const items = await Promise.all(
          workflowIds.map(async (workflowId: string) => {
            const definition = await this.fetchWorkflowDefinition(workflowId);
            if (!definition) {
              return undefined;
            }
            const uri = await this.fetchWorkflowUri(workflowId);
            if (!uri) {
              return undefined;
            }
            return {
              uri,
              definition: {
                ...definition,
                description: definition.description ?? definition.name,
              },
            } as WorkflowItem;
          }),
        );
        return items.filter((item): item is WorkflowItem => !!item);
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching workflows: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflowOverviews(): Promise<
    WorkflowOverview[] | undefined
  > {
    try {
      const urlToFetch = `${this.url}/management/processes`;
      const response = await executeWithRetry(() => fetch(urlToFetch));

      if (response.ok) {
        const workflowIds = (await response.json()) as string[];
        if (!workflowIds?.length) {
          return [];
        }
        const items = await Promise.all(
          workflowIds.map(async (workflowId: string) => {
            return this.fetchWorkflowOverview(workflowId);
          }),
        );

        return items.filter((item): item is WorkflowOverview => !!item);
      }
      const responseStr = JSON.stringify(response);
      this.logger.error(
        `Response was NOT okay when fetch(${urlToFetch}). Received response: ${responseStr}`,
      );
    } catch (error) {
      this.logger.error(
        `Error when fetching workflows for workflowOverview: ${error}`,
      );
    }
    return undefined;
  }

  public async fetchProcessInstances(): Promise<ProcessInstance[] | undefined> {
    const graphQlQuery =
      '{ ProcessInstances ( orderBy: { start: ASC }, where: {processId: {isNull: false} } ) { id, processName, processId, businessKey, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';

    try {
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/graphql`, {
          method: 'POST',
          body: JSON.stringify({ query: graphQlQuery }),
          headers: { 'content-type': 'application/json' },
        }),
      );

      if (response.ok) {
        const json = await response.json();
        const processInstancesSrc = json.data
          .ProcessInstances as ProcessInstance[];
        const workflowItems = await this.fetchWorkflows();
        const processInstances = processInstancesSrc.map(instance => {
          const workflowItem = workflowItems?.find(
            wi => wi.definition.id === instance.processId,
          );

          if (workflowItem) {
            instance.category = getWorkflowCategory(workflowItem.definition);
            instance.description = workflowItem.definition.description;
          }
          return instance;
        });

        return processInstances;
      }
    } catch (error) {
      this.logger.error(`Error when fetching instances: ${error}`);
    }
    return undefined;
  }

  public async fetchProcessInstance(
    instanceId: string,
  ): Promise<ProcessInstance | undefined> {
    const graphQlQuery = `{ ProcessInstances (where: { id: {equal: "${instanceId}" } } ) { id, processName, processId, businessKey, state, start, lastUpdate, end, nodes { id, nodeId, definitionId, type, name, enter, exit }, variables, parentProcessInstance {id, processName, businessKey}, error { nodeDefinitionId, message} } }`;

    try {
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/graphql`, {
          method: 'POST',
          body: JSON.stringify({ query: graphQlQuery }),
          headers: { 'content-type': 'application/json' },
        }),
      );

      if (response.ok) {
        const json = await response.json();
        const processInstance = (
          json.data.ProcessInstances as ProcessInstance[]
        )?.pop();

        if (processInstance?.processId) {
          const workflowDefinition = await this.fetchWorkflowDefinition(
            processInstance.processId,
          );

          processInstance.category = getWorkflowCategory(workflowDefinition);
          processInstance.description = workflowDefinition?.description;
        }

        return processInstance;
      }
    } catch (error) {
      this.logger.error(`Error when fetching instance: ${error}`);
    }
    return undefined;
  }

  public async executeWorkflow(args: {
    workflowId: string;
    inputData: Record<string, string>;
  }): Promise<WorkflowExecutionResponse | undefined> {
    try {
      const endpoint = args.inputData?.businessKey
        ? `${this.url}/${args.workflowId}?businessKey=${args.inputData.businessKey}`
        : `${this.url}/${args.workflowId}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(args.inputData),
        headers: { 'content-type': 'application/json' },
      });
      return response.json();
    } catch (error) {
      this.logger.error(`Error when executing workflow: ${error}`);
    }
    return undefined;
  }

  public async fetchProcessInstanceJobs(
    instanceId: string,
  ): Promise<Job[] | undefined> {
    const graphQlQuery = `{ Jobs (where: { processInstanceId: { equal: "${instanceId}" } }) { id, processId, processInstanceId, rootProcessId, status, expirationTime, priority, callbackEndpoint, repeatInterval, repeatLimit, scheduledId, retries, lastUpdate, endpoint, nodeInstanceId, executionCounter } }`;

    try {
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/graphql`, {
          method: 'POST',
          body: JSON.stringify({ query: graphQlQuery }),
          headers: { 'content-type': 'application/json' },
        }),
      );

      if (response.ok) {
        const json = await response.json();
        return json.data.Jobs;
      }
    } catch (error) {
      this.logger.error(`Error when fetching jobs: ${error}`);
    }
    return undefined;
  }

  private launchSonataFlow(): void {
    const launcherCmd = this.createLauncherCommand();

    this.logger.info(
      `Auto starting SonataFlow through: ${
        launcherCmd.command
      } ${launcherCmd.args.join(' ')}`,
    );

    const process = spawn(launcherCmd.command, launcherCmd.args, {
      shell: false,
    });

    process.on('close', code => {
      this.logger.info(`SonataFlow process exited with code ${code}`);
    });

    process.on('exit', code => {
      this.logger.info(`SonataFlow process exited with code ${code}`);
    });

    process.on('error', error => {
      this.logger.error(`SonataFlow process error: ${error}`);
    });
  }

  private async isSonataFlowUp(withRetry: boolean): Promise<boolean> {
    const healthUrl = `${this.url}/q/health`;
    this.logger.info(`Checking SonataFlow health at: ${healthUrl}`);

    try {
      const response = await executeWithRetry(
        () => fetch(healthUrl),
        withRetry ? 15 : 1,
      );
      if (response.ok) {
        this.logger.info('SonataFlow is up and running');
        return true;
      }
    } catch (e) {
      this.logger.error(`Error when checking SonataFlow health: ${e}`);
    }
    return false;
  }

  private createLauncherCommand(): LauncherCommand {
    const resourcesAbsPath = resolve(
      join(this.connection.resourcesPath, DEFAULT_WORKFLOWS_PATH),
    );

    const launcherArgs = [
      'run',
      '--add-host',
      'host.docker.internal:host-gateway',
    ];

    if (this.connection.jira) {
      launcherArgs.push(`--add-host`, `jira.test:${this.connection.jira.host}`);
    }

    launcherArgs.push('--rm');
    launcherArgs.push('-p', `${this.connection.port ?? 80}:8080`);
    launcherArgs.push(
      '-v',
      `${resourcesAbsPath}:${SONATA_FLOW_RESOURCES_PATH}`,
    );
    launcherArgs.push('-e', 'KOGITO.CODEGEN.PROCESS.FAILONERROR=false');
    launcherArgs.push(
      '-e',
      `QUARKUS_EMBEDDED_POSTGRESQL_DATA_DIR=${this.connection.persistencePath}`,
    );

    if (this.connection.jira) {
      launcherArgs.push(
        '-e',
        'QUARKUS_REST_CLIENT_JIRA_OPENAPI_JSON_URL=http://jira.test:8080 -e ',
      );
      launcherArgs.push(`JIRABEARERTOKEN=${this.connection.jira.bearerToken}`);
    }

    launcherArgs.push(this.connection.containerImage);

    return {
      command: 'docker',
      args: launcherArgs,
    };
  }

  private extractConnectionConfig(config: Config): SonataFlowConnectionConfig {
    const autoStart =
      config.getOptionalBoolean('orchestrator.sonataFlowService.autoStart') ??
      false;

    const host = config.getString('orchestrator.sonataFlowService.baseUrl');
    const port = config.getOptionalNumber(
      'orchestrator.sonataFlowService.port',
    );

    const resourcesPath =
      config.getOptionalString(
        'orchestrator.sonataFlowService.workflowsSource.localPath',
      ) ?? '';

    const containerImage =
      config.getOptionalString('orchestrator.sonataFlowService.container') ??
      DEFAULT_SONATAFLOW_CONTAINER_IMAGE;

    const persistencePath =
      config.getOptionalString(
        'orchestrator.sonataFlowService.persistence.path',
      ) ?? DEFAULT_SONATAFLOW_PERSISTANCE_PATH;

    const jiraHost = config.getOptionalString('orchestrator.jira.host');
    const jiraBearerToken = config.getOptionalString(
      'orchestrator.jira.bearerToken',
    );

    const jiraConfig: JiraConfig | undefined =
      jiraHost && jiraBearerToken
        ? {
            host: jiraHost,
            bearerToken: jiraBearerToken,
          }
        : undefined;

    return {
      autoStart,
      host,
      port,
      containerImage,
      resourcesPath,
      persistencePath,
      jira: jiraConfig,
    };
  }

  public async fetchWorkflowOverview(
    workflowId: string,
  ): Promise<WorkflowOverview | undefined> {
    const definition = await this.fetchWorkflowDefinition(workflowId);
    if (!definition) {
      this.logger.debug(`Workflow definition not found: ${workflowId}`);
      return undefined;
    }
    let processInstances: ProcessInstance[] = [];
    const limit = 10;
    let offset: number = 0;

    let lastTriggered: Date = new Date(0);
    let lastRunStatus: ProcessInstanceStateValues | undefined;
    let counter = 0;
    let totalDuration = 0;

    do {
      const graphQlQuery = `{ ProcessInstances(where: {processId: {equal: "${definition.id}" } }, pagination: {limit: ${limit}, offset: ${offset}}) { processName, state, start, lastUpdate, end } }`;

      try {
        const graphQlResponse = await executeWithRetry(() =>
          fetch(`${this.url}/graphql`, {
            method: 'POST',
            body: JSON.stringify({ query: graphQlQuery }),
            headers: { 'content-type': 'application/json' },
          }),
        );

        if (graphQlResponse.ok) {
          const json = await graphQlResponse.json();
          processInstances = json.data.ProcessInstances;
        }
      } catch (error) {
        this.logger.error(`Error when fetching workflow instances: ${error}`);
      }

      for (const pInstance of processInstances) {
        if (new Date(pInstance.start) > lastTriggered) {
          lastTriggered = new Date(pInstance.start);
          lastRunStatus = pInstance.state;
        }
        if (pInstance.start && pInstance.end) {
          const start: Date = new Date(pInstance.start);
          const end: Date = new Date(pInstance.end);
          totalDuration += end.valueOf() - start.valueOf();
          counter++;
        }
      }
      offset += limit;
    } while (processInstances.length > 0);

    return {
      workflowId: definition.id,
      name: definition.name,
      uri: await this.fetchWorkflowUri(workflowId),
      lastTriggeredMs: lastTriggered.getTime(),
      lastRunStatus,
      category: getWorkflowCategory(definition),
      avgDurationMs: counter ? totalDuration / counter : undefined,
      description: definition.description,
    };
  }
}
