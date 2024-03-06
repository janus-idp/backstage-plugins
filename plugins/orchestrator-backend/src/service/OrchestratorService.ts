import { PluginTaskScheduler } from '@backstage/backend-tasks';

import { Logger } from 'winston';

import {
  ProcessInstance,
  ProcessInstanceVariables,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../types/pagination';
import { DataIndexService } from './DataIndexService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowCacheService } from './WorkflowCacheService';

type CacheHandler = 'skip' | 'throw';

export class OrchestratorService {
  private readonly workflowCacheService: WorkflowCacheService;

  constructor(
    logger: Logger,
    private readonly sonataFlowService: SonataFlowService,
    private readonly dataIndexService: DataIndexService,
    private readonly scheduler: PluginTaskScheduler,
  ) {
    this.workflowCacheService = new WorkflowCacheService(
      logger,
      dataIndexService,
      sonataFlowService,
    );

    this.init();
  }

  private init() {
    this.workflowCacheService.schedule({ scheduler: this.scheduler });
  }

  private isAvailableOnCache(
    definitionId: string,
    cacheHandler: CacheHandler,
  ): boolean {
    const isAvailable = this.workflowCacheService.contains(definitionId);
    if (!isAvailable && cacheHandler === 'throw') {
      throw new Error(
        `Workflow service "${definitionId}" not available at the moment`,
      );
    }
    return isAvailable;
  }

  // Data Index Service Wrapper

  public async abortWorkflowInstance(args: {
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<void> {
    const { instanceId, cacheHandler = 'skip' } = args;
    const definitionId =
      await this.dataIndexService.fetchDefinitionIdByInstanceId(instanceId);
    if (!definitionId || !this.isAvailableOnCache(definitionId, cacheHandler)) {
      return;
    }
    await this.dataIndexService.abortWorkflowInstance(instanceId);
  }

  public async fetchWorkflowInfo(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowInfo | undefined> {
    const { definitionId, cacheHandler = 'skip' } = args;
    if (!this.isAvailableOnCache(definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.dataIndexService.fetchWorkflowInfo(definitionId);
  }

  public async fetchWorkflowInfos(
    cacheHandler: CacheHandler = 'skip',
  ): Promise<WorkflowInfo[]> {
    const workflowInfos = await this.dataIndexService.fetchWorkflowInfos();
    return workflowInfos.filter(workflowInfo =>
      this.isAvailableOnCache(workflowInfo.id, cacheHandler),
    );
  }

  public async fetchInstances(args: {
    pagination?: Pagination;
    cacheHandler?: CacheHandler;
  }): Promise<ProcessInstance[]> {
    const { pagination, cacheHandler = 'skip' } = args;
    const workflowInstances =
      await this.dataIndexService.fetchInstances(pagination);
    return workflowInstances.filter(workflowInstance =>
      this.isAvailableOnCache(workflowInstance.processId, cacheHandler),
    );
  }

  public async fetchInstancesTotalCount(): Promise<number> {
    return await this.dataIndexService.fetchInstancesTotalCount();
  }

  public async fetchWorkflowSource(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<string | undefined> {
    const { definitionId, cacheHandler = 'skip' } = args;
    if (!this.isAvailableOnCache(definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.dataIndexService.fetchWorkflowSource(definitionId);
  }

  public async fetchInstancesByDefinitionId(args: {
    definitionId: string;
    limit: number;
    offset: number;
    cacheHandler?: CacheHandler;
  }): Promise<ProcessInstance[]> {
    const { cacheHandler = 'skip' } = args;
    const workflowInstances =
      await this.dataIndexService.fetchInstancesByDefinitionId(args);
    return workflowInstances.filter(workflowInstance =>
      this.isAvailableOnCache(workflowInstance.processId, cacheHandler),
    );
  }

  public async fetchInstanceVariables(args: {
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<ProcessInstanceVariables | undefined> {
    const { instanceId, cacheHandler = 'skip' } = args;
    const definitionId =
      await this.dataIndexService.fetchDefinitionIdByInstanceId(instanceId);
    if (!definitionId || !this.isAvailableOnCache(definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.dataIndexService.fetchInstanceVariables(instanceId);
  }

  public async fetchInstance(args: {
    instanceId: string;
    cacheHandler?: CacheHandler;
  }): Promise<ProcessInstance | undefined> {
    const { instanceId, cacheHandler = 'skip' } = args;
    const instance = await this.dataIndexService.fetchInstance(instanceId);
    if (
      !instance ||
      !this.isAvailableOnCache(instance.processId, cacheHandler)
    ) {
      return undefined;
    }
    return instance;
  }

  // SonataFlow Service Wrapper

  public async fetchWorkflowInfoOnService(args: {
    definitionId: string;
    serviceUrl: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowInfo | undefined> {
    const { definitionId, cacheHandler = 'skip' } = args;
    if (!this.isAvailableOnCache(definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.sonataFlowService.fetchWorkflowInfoOnService(args);
  }

  public async fetchWorkflowDefinition(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowDefinition | undefined> {
    const { definitionId, cacheHandler = 'skip' } = args;
    if (!this.isAvailableOnCache(definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.sonataFlowService.fetchWorkflowDefinition(definitionId);
  }

  public async fetchWorkflowOverviews(args: {
    pagination?: Pagination;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowOverview[] | undefined> {
    const { pagination, cacheHandler = 'skip' } = args;
    const overviews =
      await this.sonataFlowService.fetchWorkflowOverviews(pagination);
    return overviews?.filter(overview =>
      this.isAvailableOnCache(overview.workflowId, cacheHandler),
    );
  }

  public async executeWorkflow(args: {
    definitionId: string;
    endpoint: string;
    inputData: Record<string, string>;
    businessKey?: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowExecutionResponse | undefined> {
    const { cacheHandler = 'skip' } = args;
    if (!this.isAvailableOnCache(args.definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.sonataFlowService.executeWorkflow(args);
  }

  public async fetchWorkflowOverview(args: {
    definitionId: string;
    cacheHandler?: CacheHandler;
  }): Promise<WorkflowOverview | undefined> {
    const { definitionId, cacheHandler = 'skip' } = args;
    if (!this.isAvailableOnCache(definitionId, cacheHandler)) {
      return undefined;
    }
    return await this.sonataFlowService.fetchWorkflowOverview(definitionId);
  }
}
