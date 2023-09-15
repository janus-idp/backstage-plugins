import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
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

import { SwfApi } from './api';

export interface SwfClientOptions {
  discoveryApi: DiscoveryApi;
}
export class SwfClient implements SwfApi {
  private readonly discoveryApi: DiscoveryApi;
  constructor(options: SwfClientOptions) {
    this.discoveryApi = options.discoveryApi;
  }

  async executeWorkflow(args: {
    swfId: string;
    parameters: Record<string, JsonValue>;
  }): Promise<WorkflowExecutionResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/execute/${args.swfId}`, {
      method: 'POST',
      body: JSON.stringify(args.parameters),
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async getSwf(swfId: string): Promise<SwfItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/items/${swfId}`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return await res.json();
  }

  async listSwfs(): Promise<SwfListResult> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/items`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: SwfListResult = await res.json();
    return data;
  }

  async getInstances(): Promise<ProcessInstance[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/instances`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: ProcessInstance[] = await res.json();
    return data;
  }

  async getInstance(instanceId: string): Promise<ProcessInstance> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/instances/${instanceId}`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: ProcessInstance = await res.json();
    return data;
  }

  async getInstanceJobs(instanceId: string): Promise<Job[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/instances/${instanceId}/jobs`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: Job[] = await res.json();
    return data;
  }

  async getWorkflowDataInputSchema(
    swfId: string,
  ): Promise<WorkflowDataInputSchemaResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/items/${swfId}/schema`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    const data: WorkflowDataInputSchemaResponse = await res.json();
    return data;
  }

  async createWorkflowDefinition(
    uri: string,
    content: string,
  ): Promise<SwfItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
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

  async deleteWorkflowDefinition(swfId: string): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/workflows/${swfId}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
  }

  async getSpecs(): Promise<SwfSpecFile[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('swf');
    const res = await fetch(`${baseUrl}/specs`);
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }
}
