import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
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

import { OrchestratorApi } from './api';

export interface OrchestratorClientOptions {
  discoveryApi: DiscoveryApi;
}
export class OrchestratorClient implements OrchestratorApi {
  private readonly discoveryApi: DiscoveryApi;
  constructor(options: OrchestratorClientOptions) {
    this.discoveryApi = options.discoveryApi;
  }

  async executeWorkflow(args: {
    workflowId: string;
    parameters: Record<string, JsonValue>;
  }): Promise<WorkflowExecutionResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/workflows/${args.workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(args.parameters),
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async getWorkflow(workflowId: string): Promise<WorkflowItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/workflows/${workflowId}`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async listWorkflows(): Promise<WorkflowListResult> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/workflows`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async getInstances(): Promise<ProcessInstance[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/instances`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async getInstance(instanceId: string): Promise<ProcessInstance> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/instances/${instanceId}`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async getInstanceJobs(instanceId: string): Promise<Job[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/instances/${instanceId}/jobs`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async getWorkflowDataInputSchema(
    workflowId: string,
  ): Promise<WorkflowDataInputSchemaResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/workflows/${workflowId}/schema`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async createWorkflowDefinition(
    uri: string,
    content: string,
  ): Promise<WorkflowItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/workflows?uri=${uri}`, {
      method: 'POST',
      body: content,
      headers: {
        'content-type': 'text/plain',
      },
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async deleteWorkflowDefinition(workflowId: string): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
  }

  async getSpecs(): Promise<WorkflowSpecFile[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('orchestrator');
    const res = await fetch(`${baseUrl}/specs`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }
}
