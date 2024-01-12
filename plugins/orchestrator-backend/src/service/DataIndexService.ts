import { Client, fetchExchange } from '@urql/core';
import { Logger } from 'winston';

import {
  fromWorkflowSource,
  getWorkflowCategory,
  Job,
  ProcessInstance,
  WorkflowDefinition,
  WorkflowInfo,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { ErrorBuilder } from '../helpers/errorBuilder';

export class DataIndexService {
  private client: Client;

  public constructor(
    private readonly dataIndexUrl: string,
    private readonly logger: Logger,
  ) {
    if (!dataIndexUrl.length) {
      throw ErrorBuilder.GET_NO_DATA_INDEX_URL_ERR();
    }

    this.client = this.getNewGraphQLClient();
    this.logger.info('DataIndexService Initialized');
  }

  private getNewGraphQLClient(): Client {
    const diURL = `${this.dataIndexUrl}/graphql`;
    return new Client({
      url: diURL,
      exchanges: [fetchExchange],
    });
  }

  public async getWorkflowDefinition(
    definitionId: string,
  ): Promise<WorkflowInfo> {
    const graphQlQuery = `{ ProcessDefinitions ( where: {id: {equal: "${definitionId}" } } ) { id, name, version, type, endpoint, serviceUrl, source } }`;

    const result = await this.client.query(graphQlQuery, {});

    if (result.error) {
      this.logger.error(`Error fetching workflow definition ${result.error}`);
      throw result.error;
    }
    return (result.data.ProcessDefinitions as WorkflowInfo[])[0];
  }

  public async getWorkflowDefinitions(): Promise<WorkflowInfo[]> {
    const QUERY = `
        query ProcessDefinitions {
            ProcessDefinitions {
                id
                name
                version
                type
                endpoint
                serviceUrl
            }
        }
      `;

    this.logger.info(`getWorkflowDefinitions() called:  ${this.dataIndexUrl}`);
    const result = await this.client.query(QUERY, {});

    if (result.error) {
      this.logger.error(
        `Error fetching data index swf results ${result.error}`,
      );
      throw result.error;
    }

    return result.data.ProcessDefinitions;
  }

  public async fetchProcessInstances(): Promise<ProcessInstance[] | undefined> {
    const graphQlQuery =
      '{ ProcessInstances ( orderBy: { start: ASC }, where: {processId: {isNull: false} } ) { id, processName, processId, businessKey, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';

    const response = await this.client.query(graphQlQuery, {});

    if (response.error) {
      this.logger.error(`Error when fetching instances: ${response.error}`);
      throw response.error;
    }

    const processInstancesSrc = response.data
      .ProcessInstances as ProcessInstance[];

    const processInstances = await Promise.all(
      processInstancesSrc.map(async instance => {
        return await this.getWorkflowDefinitionFromInstance(instance);
      }),
    );
    return processInstances;
  }

  private async getWorkflowDefinitionFromInstance(instance: ProcessInstance) {
    const workflowItem: WorkflowInfo = await this.getWorkflowDefinition(
      instance.processId,
    );
    if (!workflowItem?.source) {
      throw new Error(
        `Workflow defintion is required to fetch instance ${instance.id}`,
      );
    }
    const workflowDefinitionSrc: WorkflowDefinition = fromWorkflowSource(
      workflowItem.source,
    );
    if (workflowItem) {
      instance.category = getWorkflowCategory(workflowDefinitionSrc);
      instance.description = workflowItem.description;
    }
    return instance;
  }

  public async fetchWorkflowSource(
    workflowId: string,
  ): Promise<string | undefined> {
    const graphQlQuery = `{ ProcessDefinitions ( where: {id: {equal: "${workflowId}" } } ) { id, source } }`;

    const response = await this.client.query(graphQlQuery, {});

    if (response.error) {
      this.logger.error(
        `Error when fetching workflow source: ${response.error}`,
      );
      return undefined;
    }

    return response.data.ProcessDefinitions[0].source;
  }

  public async fetchWorkflowInstances(
    workflowId: string,
    limit: number,
    offset: number,
  ): Promise<ProcessInstance[]> {
    const graphQlQuery = `{ ProcessInstances(where: {processId: {equal: "${workflowId}" } }, pagination: {limit: ${limit}, offset: ${offset}}) { processName, state, start, lastUpdate, end } }`;

    const result = await this.client.query(graphQlQuery, {});

    if (result.error) {
      this.logger.error(
        `Error when fetching workflow instances: ${result.error}`,
      );
      throw result.error;
    }

    return result.data.ProcessInstances;
  }

  public async fetchProcessInstanceJobs(
    instanceId: string,
  ): Promise<Job[] | undefined> {
    const graphQlQuery = `{ Jobs (where: { processInstanceId: { equal: "${instanceId}" } }) { id, processId, processInstanceId, rootProcessId, status, expirationTime, priority, callbackEndpoint, repeatInterval, repeatLimit, scheduledId, retries, lastUpdate, endpoint, nodeInstanceId, executionCounter } }`;

    const result = await this.client.query(graphQlQuery, {});

    if (result.error) {
      this.logger.error(`Error when fetching jobs instances: ${result.error}`);
      throw result.error;
    }

    return result.data.Jobs;
  }

  public async fetchProcessInstance(
    instanceId: string,
  ): Promise<ProcessInstance | undefined> {
    const graphQlQuery = `{ ProcessInstances (where: { id: {equal: "${instanceId}" } } ) { id, processName, processId, businessKey, state, start, lastUpdate, end, nodes { id, nodeId, definitionId, type, name, enter, exit }, variables, parentProcessInstance {id, processName, businessKey}, error { nodeDefinitionId, message} } }`;

    const result = await this.client.query(graphQlQuery, {});

    if (result.error) {
      this.logger.error(
        `Error when fetching process instances: ${result.error}`,
      );
      throw result.error;
    }

    const instance = (result.data.ProcessInstances as ProcessInstance[])[0];
    const workflowItem: WorkflowInfo = await this.getWorkflowDefinition(
      instance.processId,
    );
    if (!workflowItem?.source) {
      throw new Error(
        `Workflow defintion is required to fetch instance ${instance.id}`,
      );
    }
    const workflowDefinitionSrc: WorkflowDefinition = fromWorkflowSource(
      workflowItem.source,
    );
    if (workflowItem) {
      instance.category = getWorkflowCategory(workflowDefinitionSrc);
      instance.description = workflowItem.description;
    }
    return instance;
  }
}
