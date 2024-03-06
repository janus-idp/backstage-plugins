import { Logger } from 'winston';

import {
  extractWorkflowFormat,
  fromWorkflowSource,
  getWorkflowCategory,
  ProcessInstance,
  ProcessInstanceStateValues,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { DataIndexService } from './DataIndexService';
import { executeWithRetry } from './Helper';

export class SonataFlowService {
  constructor(
    private readonly dataIndexService: DataIndexService,
    private readonly logger: Logger,
  ) {}

  public async fetchWorkflowInfoOnService(args: {
    definitionId: string;
    serviceUrl: string;
  }): Promise<WorkflowInfo | undefined> {
    try {
      const urlToFetch = `${args.serviceUrl}/management/processes/${args.definitionId}`;
      const response = await executeWithRetry(() => fetch(urlToFetch));

      if (response.ok) {
        const json = await response.json();
        this.logger.debug(
          `Fetch workflow info result: ${JSON.stringify(json)}`,
        );
        return json;
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

  public async fetchWorkflowDefinition(
    definitionId: string,
  ): Promise<WorkflowDefinition | undefined> {
    try {
      const source =
        await this.dataIndexService.fetchWorkflowSource(definitionId);
      if (source) {
        return fromWorkflowSource(source);
      }
    } catch (error) {
      this.logger.error(`Error when fetching workflow definition: ${error}`);
    }
    return undefined;
  }

  public async fetchWorkflowOverviews(
    pagination?: Pagination,
  ): Promise<WorkflowOverview[] | undefined> {
    try {
      const workflowInfos =
        await this.dataIndexService.fetchWorkflowInfos(pagination);
      if (!workflowInfos?.length) {
        return [];
      }
      const items = await Promise.all(
        workflowInfos
          .filter(info => info.source)
          .map(info => this.fetchWorkflowOverviewBySource(info.source!)),
      );
      return items.filter((item): item is WorkflowOverview => !!item);
    } catch (error) {
      this.logger.error(
        `Error when fetching workflows for workflowOverview: ${error}`,
      );
    }
    return undefined;
  }

  public async executeWorkflow(args: {
    definitionId: string;
    endpoint: string;
    inputData: Record<string, string>;
    businessKey?: string;
  }): Promise<WorkflowExecutionResponse | undefined> {
    try {
      const workflowEndpoint = args.businessKey
        ? `${args.endpoint}/${args.definitionId}?businessKey=${args.businessKey}`
        : `${args.endpoint}/${args.definitionId}`;

      const result = await fetch(workflowEndpoint, {
        method: 'POST',
        body: JSON.stringify(args.inputData),
        headers: { 'content-type': 'application/json' },
      });

      const json = await result.json();
      this.logger.debug(`Execute workflow result: ${JSON.stringify(json)}`);
      return json;
    } catch (error) {
      this.logger.error(`Error when executing workflow: ${error}`);
    }
    return undefined;
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
    try {
      const urlToFetch = `${args.serviceUrl}/management/processes/${args.definitionId}`;
      const response = await fetch(urlToFetch);
      return response.ok;
    } catch (error) {
      this.logger.debug(`Error when pinging workflow service: ${error}`);
    }
    return false;
  }
}
