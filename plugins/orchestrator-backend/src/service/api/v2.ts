import {
  ASSESSMENT_WORKFLOW_TYPE,
  WorkflowCategoryDTO,
  WorkflowDefinition,
  WorkflowListResult,
  WorkflowListResultDTO,
  WorkflowOverview,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from '../DataIndexService';
import { SonataFlowService } from '../SonataFlowService';
import { getWorkflowOverviewV1, getWorkflowsV1 } from './v1';

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

export async function getWorkflowsV2(
  sonataFlowService: SonataFlowService,
  dataIndexService: DataIndexService,
): Promise<WorkflowListResultDTO> {
  const definitions: WorkflowListResult = await getWorkflowsV1(
    sonataFlowService,
    dataIndexService,
  );
  return mapToWorkflowListResultDTO(definitions);
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

function mapToWorkflowListResultDTO(
  definitions: WorkflowListResult,
): WorkflowListResultDTO {
  const result = {
    items: definitions.items.map(def => {
      return {
        annotations: def.definition.annotations,
        category: getWorkflowCategoryDTO(def.definition),
        description: def.definition.description,
        name: def.definition.name,
        uri: def.uri,
        id: def.definition.id,
      };
    }),
    paginationInfo: {
      limit: definitions.limit,
      offset: definitions.offset,
      totalCount: definitions.totalCount,
    },
  };
  return result;
}

function getWorkflowCategoryDTO(
  definition: WorkflowDefinition | undefined,
): WorkflowCategoryDTO {
  if (definition === undefined) {
    return WorkflowCategoryDTO.INFRASTRUCTURE;
  }
  return definition?.annotations?.find(
    annotation => annotation === ASSESSMENT_WORKFLOW_TYPE,
  )
    ? WorkflowCategoryDTO.ASSESSMENT
    : WorkflowCategoryDTO.INFRASTRUCTURE;
}
