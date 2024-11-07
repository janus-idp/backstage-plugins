import { LoggerService } from '@backstage/backend-plugin-api';

import {
  extractWorkflowFormat,
  Filter,
  fromWorkflowSource,
  getWorkflowCategory,
  ProcessInstance,
  ProcessInstanceStateValues,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { DataIndexService } from './DataIndexService';

export class SonataFlowService {
  constructor(
    private readonly dataIndexService: DataIndexService,
    private readonly logger: LoggerService,
  ) {}

  public async fetchWorkflowInfoOnService(args: {
    definitionId: string;
    serviceUrl: string;
  }): Promise<WorkflowInfo | undefined> {
    const urlToFetch = `${args.serviceUrl}/management/processes/${args.definitionId}`;
    const response = await fetch(urlToFetch);

    if (response.ok) {
      const json = await response.json();
      this.logger.debug(`Fetch workflow info result: ${JSON.stringify(json)}`);
      return json;
    }
    throw new Error(
      await this.createPrefixFetchErrorMessage(urlToFetch, response),
    );
  }

  public async fetchWorkflowDefinition(
    definitionId: string,
  ): Promise<WorkflowDefinition | undefined> {
    const source =
      await this.dataIndexService.fetchWorkflowSource(definitionId);
    if (source) {
      return fromWorkflowSource(source);
    }
    return undefined;
  }

  public async fetchWorkflowOverviews(args: {
    definitionIds?: string[];
    pagination?: Pagination;
    filter?: Filter;
  }): Promise<WorkflowOverview[] | undefined> {
    const { definitionIds, pagination, filter } = args;
    const workflowInfos = await this.dataIndexService.fetchWorkflowInfos({
      definitionIds,
      pagination,
      filter,
    });
    if (!workflowInfos?.length) {
      return [];
    }
    const items = await Promise.all(
      workflowInfos
        .filter(info => info.source)
        .map(info => this.fetchWorkflowOverviewBySource(info.source!)),
    );
    return items.filter((item): item is WorkflowOverview => !!item);
  }

  public async executeWorkflow(args: {
    definitionId: string;
    serviceUrl: string;
    inputData: ProcessInstanceVariables;
    businessKey?: string;
  }): Promise<WorkflowExecutionResponse | undefined> {
    const urlToFetch = args.businessKey
      ? `${args.serviceUrl}/${args.definitionId}?businessKey=${args.businessKey}`
      : `${args.serviceUrl}/${args.definitionId}`;

    const response = await fetch(urlToFetch, {
      method: 'POST',
      body: JSON.stringify(args.inputData),
      headers: { 'content-type': 'application/json' },
    });

    if (response.ok) {
      const json = await response.json();
      this.logger.debug(`Execute workflow result: ${JSON.stringify(json)}`);
      return json;
    }
    throw new Error(
      `${await this.createPrefixFetchErrorMessage(urlToFetch, response, 'POST')}`,
    );
  }

  public async fetchWorkflowOverview(
    definitionId: string,
  ): Promise<WorkflowOverview | undefined> {
    const source =
      await this.dataIndexService.fetchWorkflowSource(definitionId);
    if (!source) {
      this.logger.debug(`Workflow source not found: ${definitionId}`);
      return undefined;
    }
    return await this.fetchWorkflowOverviewBySource(source);
  }

  private async fetchWorkflowOverviewBySource(
    source: string,
  ): Promise<WorkflowOverview | undefined> {
    let processInstances: ProcessInstance[] = [];
    const limit = 10;
    let offset: number = 0;

    let lastTriggered: Date = new Date(0);
    let lastRunStatus: ProcessInstanceStateValues | undefined;
    let lastRunId: string | undefined;
    let counter = 0;
    let totalDuration = 0;
    const definition = fromWorkflowSource(source);

    do {
      processInstances =
        await this.dataIndexService.fetchInstancesByDefinitionId({
          definitionId: definition.id,
          limit,
          offset,
        });

      for (const pInstance of processInstances) {
        if (!pInstance.start) {
          continue;
        }
        if (new Date(pInstance.start) > lastTriggered) {
          lastRunId = pInstance.id;
          lastTriggered = new Date(pInstance.start);
          lastRunStatus = pInstance.state;
        }
        if (pInstance.end) {
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
      format: extractWorkflowFormat(source),
      lastRunId,
      lastTriggeredMs: lastTriggered.getTime(),
      lastRunStatus,
      category: getWorkflowCategory(definition),
      avgDurationMs: counter ? totalDuration / counter : undefined,
      description: definition.description,
    };
  }

  public async pingWorkflowService(args: {
    definitionId: string;
    serviceUrl: string;
  }): Promise<boolean> {
    const urlToFetch = `${args.serviceUrl}/management/processes/${args.definitionId}`;
    const response = await fetch(urlToFetch);
    return response.ok;
  }

  public async updateInstanceInputData(args: {
    definitionId: string;
    serviceUrl: string;
    instanceId: string;
    inputData: ProcessInstanceVariables;
  }): Promise<boolean> {
    const { definitionId, serviceUrl, instanceId, inputData } = args;
    const urlToFetch = `${serviceUrl}/${definitionId}/${instanceId}`;
    const response = await fetch(urlToFetch, {
      method: 'PATCH',
      body: JSON.stringify(inputData),
      headers: { 'content-type': 'application/json' },
    });
    return response.ok;
  }

  public async createPrefixFetchErrorMessage(
    urlToFetch: string,
    response: Response,
    httpMethod = 'GET',
  ): Promise<string> {
    const res = await response.json();
    const errorInfo = [];
    let errorMsg = `Request ${httpMethod} ${urlToFetch} failed with: StatusCode: ${response.status}`;

    if (response.statusText) {
      errorInfo.push(`StatusText: ${response.statusText}`);
    }
    if (res?.details) {
      errorInfo.push(`Details: ${res?.details}`);
    }
    if (res?.stack) {
      errorInfo.push(`Stack: ${res?.stack}`);
    }
    if (errorInfo.length > 0) {
      errorMsg += ` ${errorInfo.join(', ')}`;
    } else {
      errorMsg += ' Unexpected error';
    }

    return errorMsg;
  }
}
