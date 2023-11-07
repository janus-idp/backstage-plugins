import { createApiRef } from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import {
  Job,
  ProcessInstance,
  WorkflowDataInputSchemaResponse,
  WorkflowExecutionResponse,
  WorkflowItem,
  WorkflowListResult,
  WorkflowSpecFile,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export interface OrchestratorApi {
  executeWorkflow(args: {
    workflowId: string;
    parameters: Record<string, JsonValue>;
  }): Promise<WorkflowExecutionResponse>;

  getWorkflow(workflowId: string): Promise<WorkflowItem>;

  listWorkflows(): Promise<WorkflowListResult>;

  getInstances(): Promise<ProcessInstance[]>;

  getInstance(instanceId: string): Promise<ProcessInstance>;

  getInstanceJobs(instanceId: string): Promise<Job[]>;

  getWorkflowDataInputSchema(
    workflowId: string,
  ): Promise<WorkflowDataInputSchemaResponse>;

  createWorkflowDefinition(
    uri: string,
    content?: string,
  ): Promise<WorkflowItem>;

  deleteWorkflowDefinition(workflowId: string): Promise<any>;

  getSpecs(): Promise<WorkflowSpecFile[]>;
}

export const orchestratorApiRef = createApiRef<OrchestratorApi>({
  id: 'plugin.orchestrator.api',
});
