import { ParsedRequest } from 'openapi-backend';

import {
  AssessedProcessInstanceDTO,
  ExecuteWorkflowRequestDTO,
  ExecuteWorkflowResponseDTO,
  Filter,
  ProcessInstance,
  ProcessInstanceListResultDTO,
  ProcessInstanceState,
  ProcessInstanceVariables,
  WorkflowDTO,
  WorkflowInfo,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
  WorkflowRunStatusDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Pagination } from '../../types/pagination';
import { retryAsyncFunction } from '../Helper';
import { OrchestratorService } from '../OrchestratorService';
import {
  mapToExecuteWorkflowResponseDTO,
  mapToProcessInstanceDTO,
  mapToWorkflowDTO,
  mapToWorkflowOverviewDTO,
  mapToWorkflowRunStatusDTO,
} from './mapping/V2Mappings';

const FETCH_INSTANCE_MAX_ATTEMPTS = 10;
const FETCH_INSTANCE_RETRY_DELAY_MS = 1000;

export class V2 {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  public async getWorkflowsOverview(
    pagination: Pagination,
    filter?: Filter,
  ): Promise<WorkflowOverviewListResultDTO> {
    const overviews = await this.orchestratorService.fetchWorkflowOverviews({
      pagination,
      filter,
    });
    if (!overviews) {
      throw new Error("Couldn't fetch workflow overviews");
    }
    const result: WorkflowOverviewListResultDTO = {
      overviews: overviews.map(item => mapToWorkflowOverviewDTO(item)),
      paginationInfo: {
        pageSize: pagination.limit,
        offset: pagination.offset,
        totalCount: overviews.length,
      },
    };
    return result;
  }

  public async getWorkflowOverviewById(
    workflowId: string,
  ): Promise<WorkflowOverviewDTO> {
    const overview = await this.orchestratorService.fetchWorkflowOverview({
      definitionId: workflowId,
      cacheHandler: 'throw',
    });

    if (!overview) {
      throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
    }
    return mapToWorkflowOverviewDTO(overview);
  }

  public async getWorkflowById(workflowId: string): Promise<WorkflowDTO> {
    const resultV1 = await this.getWorkflowSourceById(workflowId);
    return mapToWorkflowDTO(resultV1);
  }

  public async getWorkflowSourceById(workflowId: string): Promise<string> {
    const source = await this.orchestratorService.fetchWorkflowSource({
      definitionId: workflowId,
      cacheHandler: 'throw',
    });

    if (!source) {
      throw new Error(`Couldn't fetch workflow source for ${workflowId}`);
    }

    return source;
  }

  public async getInstances(
    pagination?: Pagination,
    filter?: Filter,
    workflowId?: string,
  ): Promise<ProcessInstanceListResultDTO> {
    const instances = await this.orchestratorService.fetchInstances({
      pagination,
      filter,
      workflowId,
    });
    const totalCount = await this.orchestratorService.fetchInstancesTotalCount(
      workflowId,
      filter,
    );

    const result: ProcessInstanceListResultDTO = {
      items: instances?.map(mapToProcessInstanceDTO),
      paginationInfo: {
        pageSize: pagination?.limit,
        offset: pagination?.offset,
        totalCount: totalCount,
      },
    };
    return result;
  }

  public async getInstanceById(
    instanceId: string,
    includeAssessment: boolean = false,
  ): Promise<AssessedProcessInstanceDTO> {
    const instance = await this.orchestratorService.fetchInstance({
      instanceId,
      cacheHandler: 'throw',
    });

    if (!instance) {
      throw new Error(`Couldn't fetch process instance ${instanceId}`);
    }

    let assessedByInstance: ProcessInstance | undefined;

    if (includeAssessment && instance.businessKey) {
      assessedByInstance = await this.orchestratorService.fetchInstance({
        instanceId: instance.businessKey,
        cacheHandler: 'throw',
      });
    }

    return {
      instance: mapToProcessInstanceDTO(instance),
      assessedBy: assessedByInstance
        ? mapToProcessInstanceDTO(assessedByInstance)
        : undefined,
    };
  }

  public async executeWorkflow(
    executeWorkflowRequestDTO: ExecuteWorkflowRequestDTO,
    workflowId: string,
    businessKey: string | undefined,
  ): Promise<ExecuteWorkflowResponseDTO> {
    if (Object.keys(executeWorkflowRequestDTO?.inputData).length === 0) {
      throw new Error(
        `ExecuteWorkflowRequestDTO.inputData is required for executing workflow with id ${workflowId}`,
      );
    }

    const definition = await this.orchestratorService.fetchWorkflowInfo({
      definitionId: workflowId,
      cacheHandler: 'throw',
    });
    if (!definition) {
      throw new Error(`Couldn't fetch workflow definition for ${workflowId}`);
    }
    if (!definition.serviceUrl) {
      throw new Error(`ServiceURL is not defined for workflow ${workflowId}`);
    }
    const executionResponse = await this.orchestratorService.executeWorkflow({
      definitionId: workflowId,
      inputData:
        executeWorkflowRequestDTO?.inputData as ProcessInstanceVariables,
      serviceUrl: definition.serviceUrl,
      businessKey,
      cacheHandler: 'throw',
    });

    if (!executionResponse) {
      throw new Error(`Couldn't execute workflow ${workflowId}`);
    }

    // Making sure the instance data is available before returning
    await retryAsyncFunction({
      asyncFn: () =>
        this.orchestratorService.fetchInstance({
          instanceId: executionResponse.id,
          cacheHandler: 'throw',
        }),
      maxAttempts: FETCH_INSTANCE_MAX_ATTEMPTS,
      delayMs: FETCH_INSTANCE_RETRY_DELAY_MS,
    });

    if (!executionResponse) {
      throw new Error('Error executing workflow with id ${workflowId}');
    }

    return mapToExecuteWorkflowResponseDTO(workflowId, executionResponse);
  }

  public async abortWorkflow(instanceId: string): Promise<string> {
    await this.orchestratorService.abortWorkflowInstance({
      instanceId,
      cacheHandler: 'throw',
    });
    return `Workflow instance ${instanceId} successfully aborted`;
  }

  public async getWorkflowStatuses(): Promise<WorkflowRunStatusDTO[]> {
    return [
      ProcessInstanceState.Active,
      ProcessInstanceState.Error,
      ProcessInstanceState.Completed,
      ProcessInstanceState.Aborted,
      ProcessInstanceState.Suspended,
      ProcessInstanceState.Pending,
    ].map(status => mapToWorkflowRunStatusDTO(status));
  }

  public async getWorkflowInputSchemaById(
    workflowId: string,
    serviceUrl: string,
  ): Promise<WorkflowInfo | undefined> {
    return this.orchestratorService.fetchWorkflowInfoOnService({
      definitionId: workflowId,
      serviceUrl: serviceUrl,
      cacheHandler: 'throw',
    });
  }

  public extractQueryParam(
    req: ParsedRequest,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
