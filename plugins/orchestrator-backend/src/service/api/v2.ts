import {
  WorkflowCategoryDTO,
  WorkflowOverview,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { SonataFlowService } from '../SonataFlowService';
import { getWorkflowOverviewV1 } from './v1';

export async function getWorkflowOverviewV2(
  sonataFlowService: SonataFlowService,
): Promise<WorkflowOverviewListResultDTO> {
  const overviewsV1 = await getWorkflowOverviewV1(sonataFlowService);
  const result: WorkflowOverviewListResultDTO = {
    overviews: overviewsV1.items.map(item => mapToWorkflowOverviewDTO(item)),
    paginationInfo: {
      limit: 0,
      offset: 0,
      totalCount: overviewsV1.items?.length ?? 0,
    },
  };
  return result;
}

export async function getWorkflowOverviewByIdV2(
  sonataFlowService: SonataFlowService,
  workflowId: string,
): Promise<WorkflowOverviewDTO> {
  const overviewV1 = await sonataFlowService.fetchWorkflowOverview(workflowId);

  if (!overviewV1) {
    throw new Error(`Couldn't fetch workflow overview for ${workflowId}`);
  }
  return mapToWorkflowOverviewDTO(overviewV1);
}

function mapToWorkflowOverviewDTO(
  overview: WorkflowOverview,
): WorkflowOverviewDTO {
  return {
    workflowId: overview.workflowId,
    name: overview.name,
    uri: overview.uri,
    lastTriggeredMs: overview.lastTriggeredMs,
    lastRunStatus: overview.lastRunStatus,
    category: mapWorkflowCategoryDTOFromString(overview.category),
    avgDurationMs: overview.avgDurationMs,
    description: overview.description,
  };

  function mapWorkflowCategoryDTOFromString(category?: string) {
    switch (category?.toLocaleLowerCase()) {
      case 'assessment':
        return WorkflowCategoryDTO.ASSESSMENT;
      case 'infrastructure':
        return WorkflowCategoryDTO.INFRASTRUCTURE;
      default:
        return WorkflowCategoryDTO.INFRASTRUCTURE;
    }
  }
}
