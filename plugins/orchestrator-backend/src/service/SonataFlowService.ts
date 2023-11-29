import { Config } from '@backstage/config';

import { OpenAPIV3 } from 'openapi-types';
import { Logger } from 'winston';

import {
  default_sonataflow_container_image,
  default_sonataflow_persistance_path,
  default_workflows_path,
  fromWorkflowSource,
  Job,
  ProcessInstance,
  WorkflowDefinition,
  WorkflowExecutionResponse,
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
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/management/processes/${workflowId}/sources`),
      );

      if (response.ok) {
        const json = (await response.json()) as SonataFlowSource[];
        // Assuming only one source in the list
        return json.pop()?.uri;
      }
      this.logger.error(
        `Response was NOT okay when fetch(${this.url}/management/processes/${workflowId}/sources). Received response: ${response}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching workflow uri: ${error}`);
    }

    return undefined;
  }

  public async fetchWorkflowSource(
    workflowId: string,
  ): Promise<string | undefined> {
    try {
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/management/processes/${workflowId}/source`),
      );

      if (response.ok) {
        return await response.text();
      }
      this.logger.error(
        `Response was NOT okay when fetch(${this.url}/management/processes/${workflowId}/source). Received response: ${response}`,
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
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/q/openapi.json`),
      );
      if (response.ok) {
        return await response.json();
      }
      this.logger.error(
        `Response was NOT okay when fetch(${this.url}/q/openapi.json). Received response: ${response}`,
      );
    } catch (error) {
      this.logger.error(`Error when fetching openapi: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflows(): Promise<WorkflowItem[] | undefined> {
    try {
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/management/processes`),
      );

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
      this.logger.error(
        `Response was NOT okay when fetch(${this.url}/management/processes). Received response: ${response}`,
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
      const response = await executeWithRetry(() =>
        fetch(`${this.url}/management/processes`),
      );

      if (response.ok) {
        const workflowIds = (await response.json()) as string[];
        if (!workflowIds?.length) {
          return [];
        }
        const items = await Promise.all(
          workflowIds.map(async (workflowId: string) => {
            return this.getWorkflowOverview(workflowId);
          }),
        );
        return items.filter((item): item is WorkflowOverview => !!item);
      }
      this.logger.error(
        `Response was NOT okay when fetch(${this.url}/management/processes). Received response: ${response}`,
      );
    } catch (error) {
      this.logger.error(
        `Error when fetching workflows for workflowoverview: ${error}`,
      );
    }
    return undefined;
  }

  public async fetchProcessInstances(): Promise<ProcessInstance[] | undefined> {
    const graphQlQuery =
      '{ ProcessInstances ( orderBy: { start: ASC }, where: {processId: {isNull: false} } ) { id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';

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
        return json.data.ProcessInstances;
      }
    } catch (error) {
      this.logger.error(`Error when fetching instances: ${error}`);
    }
    return undefined;
  }

  public async fetchProcessInstance(
    instanceId: string,
  ): Promise<ProcessInstance | undefined> {
    const graphQlQuery = `{ ProcessInstances (where: { id: {equal: "${instanceId}" } } ) { id, processName, processId, state, start, lastUpdate, end, nodes { id, nodeId, definitionId, type, name, enter, exit }, variables, parentProcessInstance {id, processName, businessKey}, error { nodeDefinitionId, message} } }`;

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
        return (json.data.ProcessInstances as ProcessInstance[])?.pop();
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
      const response = await fetch(`${this.url}/${args.workflowId}`, {
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

  private extractWorkflowType(
    workflowDef: WorkflowDefinition,
  ): string | undefined {
    if (workflowDef.annotations) {
      for (const annotation of workflowDef.annotations) {
        if (annotation.includes('workflow-type/')) {
          const value: string = annotation.split('/')[1].trim();
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
      }
    }

    return undefined;
  }

  private createLauncherCommand(): LauncherCommand {
    const resourcesAbsPath = resolve(
      join(this.connection.resourcesPath, default_workflows_path),
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
      default_sonataflow_container_image;

    const persistencePath =
      config.getOptionalString(
        'orchestrator.sonataFlowService.persistence.path',
      ) ?? default_sonataflow_persistance_path;

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

  private async getWorkflowOverview(
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
    let lastRunStatus = '';
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

      for (let i = 0; i < processInstances.length; i++) {
        const pInstance: ProcessInstance = processInstances[i];
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
      lastRunStatus:
        lastRunStatus.length > 0
          ? lastRunStatus.charAt(0).toUpperCase() +
            lastRunStatus.slice(1).toLowerCase()
          : undefined,
      type: this.extractWorkflowType(definition),
      avgDurationMs: counter ? totalDuration / counter : undefined,
      description: definition.description,
    };
  }
}
