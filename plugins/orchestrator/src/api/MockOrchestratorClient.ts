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

export interface MockOrchestratorApiData {
  createWorkflowDefinitionResponse: ReturnType<
    OrchestratorApi['createWorkflowDefinition']
  >;
  deleteWorkflowDefinitionResponse: ReturnType<
    OrchestratorApi['deleteWorkflowDefinition']
  >;
  executeWorkflowResponse: ReturnType<OrchestratorApi['executeWorkflow']>;
  getInstanceResponse: ReturnType<OrchestratorApi['getInstance']>;
  getInstancesResponse: ReturnType<OrchestratorApi['getInstances']>;
  getInstanceJobsResponse: ReturnType<OrchestratorApi['getInstanceJobs']>;
  getSpecsResponse: ReturnType<OrchestratorApi['getSpecs']>;
  getWorkflowResponse: ReturnType<OrchestratorApi['getWorkflow']>;
  getWorkflowDataInputSchemaResponse: ReturnType<
    OrchestratorApi['getWorkflowDataInputSchema']
  >;
  listWorkflowsResponse: ReturnType<OrchestratorApi['listWorkflows']>;
}

export class MockOrchestratorClient implements OrchestratorApi {
  private _mockData: Partial<MockOrchestratorApiData>;

  constructor(mockData: Partial<MockOrchestratorApiData> = {}) {
    this._mockData = mockData;
  }

  createWorkflowDefinition(
    _uri: string,
    _content?: string,
  ): Promise<WorkflowItem> {
    if (!this._mockData.createWorkflowDefinitionResponse) {
      throw new Error(`[createWorkflowDefinition]: No mock data available`);
    }

    return Promise.resolve(this._mockData.createWorkflowDefinitionResponse);
  }

  deleteWorkflowDefinition(_workflowId: string): Promise<any> {
    if (!this._mockData.deleteWorkflowDefinitionResponse) {
      throw new Error(`[deleteWorkflowDefinition]: No mock data available`);
    }

    return Promise.resolve(this._mockData.deleteWorkflowDefinitionResponse);
  }

  executeWorkflow(_args: {
    workflowId: string;
    parameters: Record<string, JsonValue>;
  }): Promise<WorkflowExecutionResponse> {
    if (!this._mockData.executeWorkflowResponse) {
      throw new Error(`[executeWorkflow]: No mock data available`);
    }

    return Promise.resolve(this._mockData.executeWorkflowResponse);
  }

  getInstance(_instanceId: string): Promise<ProcessInstance> {
    if (!this._mockData.getInstanceResponse) {
      throw new Error(`[getInstance]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getInstanceResponse);
  }

  getInstanceJobs(_instanceId: string): Promise<Job[]> {
    if (!this._mockData.getInstanceJobsResponse) {
      throw new Error(`[getInstanceJobs]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getInstanceJobsResponse);
  }

  getInstances(): Promise<ProcessInstance[]> {
    if (!this._mockData.getInstancesResponse) {
      throw new Error(`[getInstances]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getInstancesResponse);
  }

  getSpecs(): Promise<WorkflowSpecFile[]> {
    if (!this._mockData.getSpecsResponse) {
      throw new Error(`[getSpecs]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getSpecsResponse);
  }

  getWorkflow(_workflowId: string): Promise<WorkflowItem> {
    if (!this._mockData.getWorkflowResponse) {
      throw new Error(`[getWorkflow]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getWorkflowResponse);
  }

  getWorkflowDataInputSchema(
    _workflowId: string,
  ): Promise<WorkflowDataInputSchemaResponse> {
    if (!this._mockData.getWorkflowDataInputSchemaResponse) {
      throw new Error(`[getWorkflowDataInputSchema]: No mock data available`);
    }

    return Promise.resolve(this._mockData.getWorkflowDataInputSchemaResponse);
  }

  listWorkflows(): Promise<WorkflowListResult> {
    if (!this._mockData.listWorkflowsResponse) {
      throw new Error(`[listWorkflows]: No mock data available`);
    }

    return Promise.resolve(this._mockData.listWorkflowsResponse);
  }
}
