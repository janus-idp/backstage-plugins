import { createApiRef } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import {
  AssessedProcessInstance,
  Job,
  ProcessInstance,
  WorkflowExecutionResponse,
  WorkflowInputSchemaResponse,
  WorkflowItem,
  WorkflowListResult,
  WorkflowOverview,
  WorkflowOverviewListResult,
  WorkflowSpecFile,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export interface OrchestratorApi {
  abortWorkflow(workflowId: string): Promise<void>;

  executeWorkflow(args: {
    workflowId: string;
    parameters: JsonObject;
    businessKey?: string;
  }): Promise<WorkflowExecutionResponse>;

  getWorkflow(workflowId: string): Promise<WorkflowItem>;

  listWorkflows(): Promise<WorkflowListResult>;

  listWorkflowsOverview(): Promise<WorkflowOverviewListResult>;

  getInstances(): Promise<ProcessInstance[]>;

  getInstance(
    instanceId: string,
    includeAssessment: boolean,
  ): Promise<AssessedProcessInstance>;

  getInstanceJobs(instanceId: string): Promise<Job[]>;

  getWorkflowDataInputSchema(args: {
    workflowId: string;
    instanceId?: string;
    assessmentInstanceId?: string;
  }): Promise<WorkflowInputSchemaResponse>;

  createWorkflowDefinition(
    uri: string,
    content?: string,
  ): Promise<WorkflowItem>;

  deleteWorkflowDefinition(workflowId: string): Promise<any>;

  getSpecs(): Promise<WorkflowSpecFile[]>;

  getWorkflowOverview(workflowId: string): Promise<WorkflowOverview>;
}

export const orchestratorApiRef = createApiRef<OrchestratorApi>({
  id: 'plugin.orchestrator.api',
});
