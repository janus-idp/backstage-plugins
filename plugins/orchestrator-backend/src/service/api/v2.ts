import { ParsedRequest } from 'openapi-backend';

import {
  AssessedProcessInstance,
  AssessedProcessInstanceDTO,
  ExecuteWorkflowRequestDTO,
  ExecuteWorkflowResponseDTO,
  ProcessInstancesDTO,
  ProcessInstanceState,
  WorkflowDataDTO,
  WorkflowDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
  WorkflowRunStatusDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from '../DataIndexService';
import { SonataFlowService } from '../SonataFlowService';
import {
  mapToExecuteWorkflowResponseDTO,
  mapToGetWorkflowInstanceResults,
  mapToProcessInstanceDTO,
  mapToWorkflowDTO,
  mapToWorkflowOverviewDTO,
} from './mapping/V2Mappings';
import { V1 } from './v1';

export namespace V2 {
  export async function getWorkflowsOverview(
    sonataFlowService: SonataFlowService,
  ): Promise<WorkflowOverviewListResultDTO> {
    const overviewsV1 = await V1.getWorkflowsOverview(sonataFlowService);
    const result: WorkflowOverviewListResultDTO = {
      overviews: overviewsV1.items.map(item => mapToWorkflowOverviewDTO(item)),
      paginationInfo: {
        limit: 0,
        offset: 0,
        totalCount: overviewsV1.items?.length ?? 0,
      },
    };
    return result;
  }

  export async function getWorkflowOverviewById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<WorkflowOverviewDTO> {
    const overviewV1 = await V1.getWorkflowOverviewById(
      sonataFlowService,
      workflowId,
    );

    if (!overviewV1) {
      throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
    }
    return mapToWorkflowOverviewDTO(overviewV1);
  }

  export async function getWorkflowById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<WorkflowDTO> {
    const resultV1 = await V1.getWorkflowSourceById(
      sonataFlowService,
      workflowId,
    );
    return mapToWorkflowDTO(resultV1);
  }

  export async function getWorkflowSourceById(
    sonataFlowService: SonataFlowService,
    workflowId: string,
  ): Promise<string> {
    const resultV1 = await V1.getWorkflowSourceById(
      sonataFlowService,
      workflowId,
    );
    return resultV1;
  }

  export async function getInstances(
    dataIndexService: DataIndexService,
  ): Promise<ProcessInstancesDTO> {
    const instances = await V1.getInstances(dataIndexService);
    const result = instances.map(def => mapToProcessInstanceDTO(def));

    return result;
  }

  export async function getInstanceById(
    dataIndexService: DataIndexService,
    instanceId: string,
    includeAssessment?: string,
  ): Promise<AssessedProcessInstanceDTO> {
    const instance: AssessedProcessInstance = await V1.getInstanceById(
      dataIndexService,
      instanceId,
      includeAssessment,
    );

    if (!instance) {
      throw new Error(`Couldn't fetch process instance ${instanceId}`);
    }

    return {
      instance: mapToProcessInstanceDTO(instance.instance),
      assessedBy: instance.assessedBy
        ? mapToProcessInstanceDTO(instance.assessedBy)
        : undefined,
    };
  }

  export async function executeWorkflow(
    dataIndexService: DataIndexService,
    sonataFlowService: SonataFlowService,
    executeWorkflowRequestDTO: ExecuteWorkflowRequestDTO,
    workflowId: string,
    businessKey: string | undefined,
  ): Promise<ExecuteWorkflowResponseDTO> {
    if (!dataIndexService) {
      throw new Error(
        `No data index service provided for executing workflow with id ${workflowId}`,
      );
    }

    if (!sonataFlowService) {
      throw new Error(
        `No sonata flow service provided for executing workflow with id ${workflowId}`,
      );
    }

    if (Object.keys(executeWorkflowRequestDTO?.inputData).length === 0) {
      throw new Error(
        `ExecuteWorkflowRequestDTO.inputData is required for executing workflow with id ${workflowId}`,
      );
    }

    const executeWorkflowResponse = await V1.executeWorkflow(
      dataIndexService,
      sonataFlowService,
      executeWorkflowRequestDTO,
      workflowId,
      businessKey,
    );

    if (!executeWorkflowResponse) {
      throw new Error('Error executing workflow with id ${workflowId}');
    }

    return mapToExecuteWorkflowResponseDTO(workflowId, executeWorkflowResponse);
  }

  export async function abortWorkflow(
    dataIndexService: DataIndexService,
    workflowId: string,
  ): Promise<string> {
    await V1.abortWorkflow(dataIndexService, workflowId);
    return 'Workflow ${workflowId} successfully aborted';
  }

  export async function getWorkflowResults(
    dataIndexService: DataIndexService,
    instanceId: string,
    includeAssessment?: string,
  ): Promise<WorkflowDataDTO> {
    if (!instanceId) {
      throw new Error(`No instance id was provided to get workflow results`);
    }
    if (!dataIndexService) {
      throw new Error(
        `No data index service provided for executing workflow with id ${instanceId}`,
      );
    }

    const instanceResult = await V1.getInstanceById(
      dataIndexService,
      instanceId,
      includeAssessment,
    );

    if (!instanceResult.instance?.variables) {
      throw new Error(
        `Error getting workflow instance results with id ${instanceId}`,
      );
    }

    return mapToGetWorkflowInstanceResults(instanceResult.instance.variables);
  }

  export async function getWorkflowStatuses(): Promise<WorkflowRunStatusDTO[]> {
    type Capitalized<S extends string> = Capitalize<Lowercase<S>>;
    const capitalize = <S extends string>(text: S): Capitalized<S> =>
      (text[0].toUpperCase() + text.slice(1).toLowerCase()) as Capitalized<S>;
    const result: WorkflowRunStatusDTO[] = [
      ProcessInstanceState.Active,
      ProcessInstanceState.Error,
      ProcessInstanceState.Completed,
      ProcessInstanceState.Aborted,
      ProcessInstanceState.Suspended,
      ProcessInstanceState.Pending,
    ].map(
      (status): WorkflowRunStatusDTO => ({
        key: capitalize(status),
        value: status,
      }),
    );
    return result;
  }

  export function extractQueryParam(
    req: ParsedRequest,
    key: string,
  ): string | undefined {
    return req.query[key] as string | undefined;
  }
}
