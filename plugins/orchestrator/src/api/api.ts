import { createApiRef } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { AxiosResponse } from 'axios';

import {
  AssessedProcessInstanceDTO,
  ExecuteWorkflowResponseDTO,
  GetInstancesRequest,
  InputSchemaResponseDTO,
  ProcessInstanceListResultDTO,
  WorkflowDefinition,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export interface OrchestratorApi {
  abortWorkflowInstance(instanceId: string): Promise<AxiosResponse<string>>;

  executeWorkflow(args: {
    workflowId: string;
    parameters: JsonObject;
    businessKey?: string;
  }): Promise<AxiosResponse<ExecuteWorkflowResponseDTO>>;

  getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition>;

  getWorkflowSource(workflowId: string): Promise<AxiosResponse<string>>;

  getInstance(
    instanceId: string,
    includeAssessment: boolean,
  ): Promise<AxiosResponse<AssessedProcessInstanceDTO>>;

  getWorkflowDataInputSchema(
    workflowId: string,
    instanceId?: string,
  ): Promise<AxiosResponse<InputSchemaResponseDTO>>;

  getWorkflowOverview(
    workflowId: string,
  ): Promise<AxiosResponse<WorkflowOverviewDTO>>;

  listWorkflowOverviews(): Promise<
    AxiosResponse<WorkflowOverviewListResultDTO>
  >;

  listInstances(
    args?: GetInstancesRequest,
  ): Promise<AxiosResponse<ProcessInstanceListResultDTO>>;
}

export const orchestratorApiRef = createApiRef<OrchestratorApi>({
  id: 'plugin.orchestrator.api',
});
