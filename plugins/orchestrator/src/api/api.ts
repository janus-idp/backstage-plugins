import { createApiRef } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { AxiosResponse } from 'axios';

import {
  AssessedProcessInstanceDTO,
  ProcessInstanceListResultDTO,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowInputSchemaResponse,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export interface OrchestratorApi {
  abortWorkflowInstance(instanceId: string): Promise<void>;

  executeWorkflow(args: {
    workflowId: string;
    parameters: JsonObject;
    businessKey?: string;
  }): Promise<WorkflowExecutionResponse>;

  retriggerInstanceInError(args: {
    instanceId: string;
    inputData: JsonObject;
  }): Promise<WorkflowExecutionResponse>;

  getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition>;

  getWorkflowSource(workflowId: string): Promise<string>;

  getInstance(
    instanceId: string,
    includeAssessment: boolean,
  ): Promise<AxiosResponse<AssessedProcessInstanceDTO>>;

  getWorkflowDataInputSchema(args: {
    workflowId: string;
    instanceId?: string;
    assessmentInstanceId?: string;
  }): Promise<WorkflowInputSchemaResponse>;

  getWorkflowOverview(
    workflowId: string,
  ): Promise<AxiosResponse<WorkflowOverviewDTO>>;

  listWorkflowOverviews(): Promise<
    AxiosResponse<WorkflowOverviewListResultDTO>
  >;

  listInstances(): Promise<AxiosResponse<ProcessInstanceListResultDTO>>;
}

export const orchestratorApiRef = createApiRef<OrchestratorApi>({
  id: 'plugin.orchestrator.api',
});
