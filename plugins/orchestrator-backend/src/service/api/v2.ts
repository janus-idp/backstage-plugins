import { WorkflowOverviewListResultDTO } from '@janus-idp/backstage-plugin-orchestrator-common';

import { SonataFlowService } from '../SonataFlowService';
import { getWorkflowOverviewV1 } from './v1';

export async function getWorkflowOverviewV2(
  sonataFlowService: SonataFlowService,
): Promise<WorkflowOverviewListResultDTO> {
  const overviewsV1 = await getWorkflowOverviewV1(sonataFlowService);
  const result: WorkflowOverviewListResultDTO = {
    overviews: overviewsV1.items,
    paginationInfo: {
      limit: 0,
      offset: 0,
      totalCount: overviewsV1.items?.length ?? 0,
    },
  };
  return result;
}
