import {
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { SonataFlowService } from '../SonataFlowService';

export async function getWorkflowOverviewV1(
  sonataFlowService: SonataFlowService,
): Promise<WorkflowOverviewListResult> {
  const overviews = await sonataFlowService.fetchWorkflowOverviews();
  if (!overviews) {
    throw new Error("Couldn't fetch workflow overviews");
  }
  const result: WorkflowOverviewListResult = {
    items: overviews,
    limit: 0,
    offset: 0,
    totalCount: overviews?.length ?? 0,
  };
  return result;
}

export async function getWorkflowOverviewByIdV1(
  sonataFlowService: SonataFlowService,
  workflowId: string,
): Promise<WorkflowOverview> {
  const overviewObj = await sonataFlowService.fetchWorkflowOverview(workflowId);

  if (!overviewObj) {
    throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
  }
  return overviewObj;
}
