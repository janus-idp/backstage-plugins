import {
  WorkflowDefinition,
  WorkflowInfo,
  WorkflowItem,
  WorkflowListResult,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from '../DataIndexService';
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

export async function getWorkflowsV1(
  sonataFlowService: SonataFlowService,
  dataIndexService: DataIndexService,
): Promise<WorkflowListResult> {
  const definitions: WorkflowInfo[] =
    await dataIndexService.getWorkflowDefinitions();
  const items: WorkflowItem[] = await Promise.all(
    definitions.map(async info => {
      const uri = await sonataFlowService.fetchWorkflowUri(info.id);
      if (!uri) {
        throw new Error(`Uri is required for workflow ${info.id}`);
      }
      const item: WorkflowItem = {
        definition: info as WorkflowDefinition,
        serviceUrl: info.serviceUrl,
        uri,
      };
      return item;
    }),
  );

  if (!items) {
    throw new Error("Couldn't fetch workflows");
  }

  return {
    items: items,
    limit: 0,
    offset: 0,
    totalCount: items?.length ?? 0,
  };
}

export async function getWorkflowByIdV1(
  sonataFlowService: SonataFlowService,
  workflowId: string,
): Promise<{ uri: string; definition: WorkflowDefinition }> {
  const definition =
    await sonataFlowService.fetchWorkflowDefinition(workflowId);

  if (!definition) {
    throw new Error(`Couldn't fetch workflow definition for ${workflowId}`);
  }

  const uri = await sonataFlowService.fetchWorkflowUri(workflowId);
  if (!uri) {
    throw new Error(`Couldn't fetch workflow uri for ${workflowId}`);
  }

  return { uri, definition };
}
