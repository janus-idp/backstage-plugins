import moment from 'moment';

import {
  ASSESSMENT_WORKFLOW_TYPE,
  ExecuteWorkflowResponseDTO,
  ProcessInstance,
  ProcessInstanceDTO,
  ProcessInstanceState,
  ProcessInstanceStatusDTO,
  WorkflowCategory,
  WorkflowCategoryDTO,
  WorkflowDataDTO,
  WorkflowDefinition,
  WorkflowDTO,
  WorkflowExecutionResponse,
  WorkflowListResult,
  WorkflowListResultDTO,
  WorkflowOverview,
  WorkflowOverviewDTO,
  WorkflowSpecFile,
  WorkflowSpecFileDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

// Mapping functions
export function mapToWorkflowOverviewDTO(
  overview: WorkflowOverview,
): WorkflowOverviewDTO {
  return {
    ...overview,
    category: mapWorkflowCategoryDTOFromString(overview.category),
  };
}

export function mapWorkflowCategoryDTOFromString(
  category?: string,
): WorkflowCategoryDTO {
  return category?.toLocaleLowerCase() === 'assessment'
    ? 'assessment'
    : 'infrastructure';
}

export function mapToWorkflowListResultDTO(
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

export function getWorkflowCategoryDTO(
  definition: WorkflowDefinition | undefined,
): WorkflowCategoryDTO {
  let result: WorkflowCategoryDTO = 'infrastructure';

  if (
    definition?.annotations?.find(
      annotation => annotation === ASSESSMENT_WORKFLOW_TYPE,
    )
  ) {
    result = 'assessment';
  }

  return result;
}

export function mapToWorkflowDTO(
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

export function mapWorkflowCategoryDTO(
  category?: WorkflowCategory,
): WorkflowCategoryDTO {
  if (category === WorkflowCategory.ASSESSMENT) {
    return 'assessment';
  }
  return 'infrastructure';
}

export function getProcessInstancesDTOFromString(
  state: string,
): ProcessInstanceStatusDTO {
  switch (state) {
    case ProcessInstanceState.Active.valueOf():
      return 'Running';
    case ProcessInstanceState.Error.valueOf():
      return 'Error';
    case ProcessInstanceState.Completed.valueOf():
      return 'Completed';
    case ProcessInstanceState.Aborted.valueOf():
      return 'Aborted';
    case ProcessInstanceState.Suspended.valueOf():
      return 'Suspended';
    default:
      throw new Error(
        'state is not one of the values of type ProcessInstanceStatusDTO',
      );
  }
}

export function mapToProcessInstanceDTO(
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
    workflow: processInstance.processName ?? processInstance.processId,
  };
}

export function mapToExecuteWorkflowResponseDTO(
  workflowId: string,
  workflowExecutionResponse: WorkflowExecutionResponse,
): ExecuteWorkflowResponseDTO {
  if (!workflowExecutionResponse?.id) {
    throw new Error(
      `Error while mapping ExecuteWorkflowResponse to ExecuteWorkflowResponseDTO for workflow with id ${workflowId}`,
    );
  }

  return {
    id: workflowExecutionResponse.id,
  };
}

export function mapToGetWorkflowInstanceResults(
  variables: string | Record<string, unknown>,
): WorkflowDataDTO {
  if (typeof variables === 'string') {
    return {
      variables: variables,
    };
  }

  let returnObject = {};
  if (variables?.workflowdata) {
    returnObject = {
      ...variables.workflowdata,
    };
  } else {
    returnObject = {
      workflowoptions: [],
    };
  }

  return returnObject;
}

export function mapToWorkflowSpecFileDTO(
  specV1: WorkflowSpecFile,
): WorkflowSpecFileDTO {
  if (!specV1.content) {
    throw new Error('Workflow specification content is empty');
  }

  return {
    content: JSON.stringify(specV1.content),
    path: specV1.path,
  };
}
