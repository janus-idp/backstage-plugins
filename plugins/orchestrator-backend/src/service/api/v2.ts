import moment from 'moment';

import {
  ASSESSMENT_WORKFLOW_TYPE,
  ProcessInstance,
  ProcessInstanceDTO,
  ProcessInstancesDTO,
  ProcessInstanceState,
  ProcessInstanceStatusDTO,
  WorkflowCategory,
  WorkflowCategoryDTO,
  WorkflowDefinition,
  WorkflowDTO,
  WorkflowListResult,
  WorkflowListResultDTO,
  WorkflowOverview,
  WorkflowOverviewDTO,
  WorkflowOverviewListResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from '../DataIndexService';
import { SonataFlowService } from '../SonataFlowService';
import {
  getInstancesV1,
  getWorkflowByIdV1,
  getWorkflowOverviewV1,
  getWorkflowsV1,
} from './v1';

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

export async function getWorkflowByIdV2(
  sonataFlowService: SonataFlowService,
  workflowId: string,
): Promise<WorkflowDTO> {
  const resultV1 = await getWorkflowByIdV1(sonataFlowService, workflowId);
  return mapToWorkflowDTO(resultV1.uri, resultV1.definition);
}

export async function getInstancesV2(
  dataIndexService: DataIndexService,
): Promise<ProcessInstancesDTO> {
  const instances = await getInstancesV1(dataIndexService);
  const result = instances.map(def => mapToProcessInstanceDTO(def));

  return result;
}

// Mapping functions
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

function mapToWorkflowDTO(
  uri: string,
  definition: WorkflowDefinition,
): WorkflowDTO {
  return {
    annotations: definition.annotations,
    category: getWorkflowCategoryDTO(definition),
    description: definition.description,
    name: definition.name,
    uri: uri,
    id: definition.id,
  };
}

function mapWorkflowCategoryDTO(category?: WorkflowCategory) {
  switch (category) {
    case WorkflowCategory.ASSESSMENT:
      return WorkflowCategoryDTO.ASSESSMENT;
    case WorkflowCategory.INFRASTRUCTURE:
      return WorkflowCategoryDTO.INFRASTRUCTURE;
    default:
      return WorkflowCategoryDTO.INFRASTRUCTURE;
  }
}

function getProcessInstancesDTOFromString(
  state: string,
): ProcessInstanceStatusDTO {
  switch (state) {
    case ProcessInstanceState.Active.valueOf():
      return ProcessInstanceStatusDTO.RUNNING;
    case ProcessInstanceState.Error.valueOf():
      return ProcessInstanceStatusDTO.ERROR;
    case ProcessInstanceState.Completed.valueOf():
      return ProcessInstanceStatusDTO.COMPLETED;
    case ProcessInstanceState.Aborted.valueOf():
      return ProcessInstanceStatusDTO.ABORTED;
    case ProcessInstanceState.Suspended.valueOf():
      return ProcessInstanceStatusDTO.SUSPENDED;
    default:
      // TODO: What is the default value?
      return ProcessInstanceStatusDTO.SUSPENDED;
  }
}

function mapToProcessInstanceDTO(
  processInstance: ProcessInstance,
): ProcessInstanceDTO {
  const start = moment(processInstance.start?.toString());
  const end = moment(processInstance.end?.toString());
  const duration = moment.duration(start.diff(end));

  let variables: Record<string, unknown> | undefined;
  if (typeof processInstance?.variables === 'string') {
    variables = JSON.parse(processInstance?.variables);
  } else {
    variables = processInstance?.variables;
  }

  return {
    category: mapWorkflowCategoryDTO(processInstance.category),
    description: processInstance.description,
    duration: duration.humanize(),
    id: processInstance.id,
    name: processInstance.processName,
    // To be fixed https://issues.redhat.com/browse/FLPATH-950
    // @ts-ignore
    workflowdata: variables?.workflowdata,
    started: start.toDate().toLocaleString(),
    status: getProcessInstancesDTOFromString(processInstance.state),
    workflow: processInstance.processName || processInstance.processId,
  };
}
