import { createApiRef } from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import {
  Job,
  ProcessInstance,
  SwfItem,
  SwfListResult,
  SwfSpecFile,
  WorkflowDataInputSchemaResponse,
  WorkflowExecutionResponse,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export interface SwfApi {
  executeWorkflow(args: {
    swfId: string;
    parameters: Record<string, JsonValue>;
  }): Promise<WorkflowExecutionResponse>;

  getSwf(swfId: string): Promise<SwfItem>;

  listSwfs(): Promise<SwfListResult>;

  getInstances(): Promise<ProcessInstance[]>;

  getInstance(instanceId: string): Promise<ProcessInstance>;

  getInstanceJobs(instanceId: string): Promise<Job[]>;

  getWorkflowDataInputSchema(
    swfId: string,
  ): Promise<WorkflowDataInputSchemaResponse>;

  createWorkflowDefinition(uri: string, content?: string): Promise<SwfItem>;

  deleteWorkflowDefinition(swfId: string): Promise<any>;

  getSpecs(): Promise<SwfSpecFile[]>;
}

export const swfApiRef = createApiRef<SwfApi>({
  id: 'plugin.swf.api',
});
