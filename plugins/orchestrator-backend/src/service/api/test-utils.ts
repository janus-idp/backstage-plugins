import { OpenAPIV3 } from 'openapi-types';

import {
  ProcessInstanceState,
  ProcessInstanceStateValues,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowFormat,
  WorkflowInfo,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';
import { OpenAPIV3 } from 'openapi-types';

interface WorkflowOverviewParams {
  suffix?: string;
  workflowId?: string;
  name?: string;
  format?: WorkflowFormat;
  lastTriggeredMs?: number;
  lastRunStatus?: ProcessInstanceStateValues;
  category?: string;
  avgDurationMs?: number;
  description?: string;
}
export function generateTestWorkflowOverview(
  params: WorkflowOverviewParams,
): WorkflowOverview {
  return {
    workflowId: params.workflowId ?? `testWorkflowId${params.suffix}`,
    name: params.name ?? `Test Workflow${params.suffix}`,
    format: params.format ?? 'yaml',
    lastTriggeredMs:
      params.lastTriggeredMs ?? Date.parse('2024-02-09T10:34:56Z'),
    lastRunStatus: params.lastRunStatus ?? ProcessInstanceState.Completed,
    category: params.category ?? 'assessment', // validate input
    avgDurationMs: params.avgDurationMs ?? 1000,
    description: params.description ?? 'Test Workflow Description',
  };
}

export function generateTestWorkflowOverviewList(
  howmany: number,
  inputParams?: WorkflowOverviewParams,
): WorkflowOverviewListResult {
  const res: WorkflowOverviewListResult = {
    items: [],
    totalCount: howmany,
    offset: 0,
    limit: 0,
  };

  for (let i = 0; i <= howmany; i++) {
    const params: WorkflowOverviewParams = inputParams ?? {};
    params.suffix = i.toString();
    res.items.push(generateTestWorkflowOverview(params));
  }

  return res;
}

export function generateTestWorkflowInfo(
  id: string = 'test_workflowId',
): WorkflowInfo {
  return {
    id: id,
    serviceUrl: 'mock/serviceurl',
  };
}

export function generateTestExecuteWorkflowResponse(
  id: string = 'test_execId',
): WorkflowExecutionResponse {
  return {
    id: id,
  };
}

// Utility function to generate fake OpenAPIV3.Document
export const fakeOpenAPIV3Document = (): OpenAPIV3.Document => {
  // Customize this function based on your OpenAPI document structure
  return {
    openapi: '3.0.0',
    info: {
      title: 'Title',
      version: '1.0.0',
    },
    paths: {},
  };
};

export const generateWorkflowDefinition: WorkflowDefinition = {
  id: 'quarkus-backend-workflow-ci-switch',
  version: '1.0',
  specVersion: '0.8',
  name: '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  description:
    '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  states: [
    {
      name: 'Test state',
      type: 'operation',
      end: true,
    },
  ],
};
