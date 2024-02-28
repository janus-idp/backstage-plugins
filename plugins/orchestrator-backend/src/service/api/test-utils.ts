import {
  ProcessInstanceState,
  ProcessInstanceStateValues,
  WorkflowDefinition,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

interface WorkflowOverviewParams {
  suffix?: string;
  workflowId?: string;
  name?: string;
  uri?: string;
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
    uri: params.uri ?? 'http://example.com',
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
