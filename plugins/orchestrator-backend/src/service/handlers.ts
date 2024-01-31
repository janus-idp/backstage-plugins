import moment from 'moment';

import {
  ASSESSMENT_WORKFLOW_TYPE,
  ExecuteWorkflowRequestDTO,
  ExecuteWorkflowResponseDTO,
  ProcessInstance,
  ProcessInstanceDTO,
  ProcessInstancesDTO,
  ProcessInstanceState,
  ProcessInstanceStatusDTO,
  WorkflowCategory,
  WorkflowCategoryDTO,
  WorkflowDefinition,
  WorkflowDTO,
  WorkflowExecutionResponse,
  WorkflowInfo,
  WorkflowItem,
  WorkflowListResult,
  WorkflowListResultDTO,
  WorkflowOverviewDTO,
  WorkflowOverviewListResult,
  WorkflowOverviewListResultDTO,
  WorkflowRunStatusDTO,
  WorkflowSpecFile,
  WorkflowSpecFileDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { DataIndexService } from './DataIndexService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowService } from './WorkflowService';

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
export async function executeWorkflowByIdV1(
  dataIndexService: DataIndexService,
  sonataFlowService: SonataFlowService,
  reqBody: Record<string, any>,
  workflowId: string,
): Promise<WorkflowExecutionResponse> {
  const definition = await dataIndexService.getWorkflowDefinition(workflowId);
  const serviceUrl = definition.serviceUrl;
  if (!serviceUrl) {
    throw new Error(`ServiceURL is not defined for workflow ${workflowId}`);
  }
  const executionResponse = await sonataFlowService.executeWorkflow({
    workflowId,
    inputData: reqBody.inputData,
    endpoint: serviceUrl,
  });

  if (!executionResponse) {
    throw new Error(`Couldn't execute workflow ${workflowId}`);
  }
  return executionResponse;
}

export async function executeWorkflowByIdV2(
  dataIndexService: DataIndexService,
  sonataFlowService: SonataFlowService,
  executeWorkflowRequestDTO: ExecuteWorkflowRequestDTO,
  workflowId: string,
): Promise<ExecuteWorkflowResponseDTO> {
  if (!dataIndexService) {
    throw new Error(
      `No data index service provided for executing workflow with id ${workflowId}`,
    );
  }

  if (!sonataFlowService) {
    throw new Error(
      `No sonata flow service provided for executing workflow with id ${workflowId}`,
    );
  }

  if (Object.keys(executeWorkflowRequestDTO?.inputData).length === 0) {
    throw new Error(
      `ExecuteWorkflowRequestDTO.inputData is required for executing workflow with id ${workflowId}`,
    );
  }

  const executeWorkflowResponse = await executeWorkflowByIdV1(
    dataIndexService,
    sonataFlowService,
    executeWorkflowRequestDTO,
    workflowId,
  );

  if (!executeWorkflowResponse) {
    throw new Error('Error executing workflow with id ${workflowId}');
  }

  return mapToExecuteWorkflowResponseDTO(workflowId, executeWorkflowResponse);
}

export async function getWorkflowOverviewById(
  sonataFlowService: SonataFlowService,
  workflowId: string,
): Promise<WorkflowOverviewDTO> {
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

  const result: WorkflowListResult = {
    items: items,
    limit: 0,
    offset: 0,
    totalCount: items?.length ?? 0,
  };

  return result;
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

export async function getWorkflowByIdV2(
  sonataFlowService: SonataFlowService,
  workflowId: string,
): Promise<WorkflowDTO> {
  const resultV1 = await getWorkflowByIdV1(sonataFlowService, workflowId);
  return mapToWorkflowDTO(resultV1.uri, resultV1.definition);
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

export async function getInstancesV1(
  dataIndexService: DataIndexService,
): Promise<ProcessInstance[]> {
  const instances = await dataIndexService.fetchProcessInstances();

  if (!instances) {
    throw new Error("Couldn't fetch process instances");
  }
  return instances;
}

export async function getInstancesV2(
  dataIndexService: DataIndexService,
): Promise<ProcessInstancesDTO> {
  const instances = await getInstancesV1(dataIndexService);
  const result = instances.map(def => mapToProcessInstanceDTO(def));

  return result;
}

export async function getInstancesByIdV1(
  dataIndexService: DataIndexService,
  instanceId: string,
): Promise<ProcessInstance> {
  const instance = await dataIndexService.fetchProcessInstance(instanceId);

  if (!instance) {
    throw new Error(`Couldn't fetch process instance ${instanceId}`);
  }
  return instance;
}

export async function getInstancesByIdV2(
  dataIndexService: DataIndexService,
  instanceId: string,
): Promise<ProcessInstanceDTO> {
  const instance: ProcessInstance = await getInstancesByIdV1(
    dataIndexService,
    instanceId,
  );
  return mapToProcessInstanceDTO(instance);
}

export async function getWorkflowSpecsV1(
  workflowService: WorkflowService,
): Promise<WorkflowSpecFile[]> {
  return await workflowService.listStoredSpecs();
}

export async function getWorkflowSpecsV2(
  workflowService: WorkflowService,
): Promise<WorkflowSpecFileDTO[]> {
  const specV1 = await getWorkflowSpecsV1(workflowService);
  return specV1.map(spec => mapToWorkflowSpecFileDTO(spec));
}

export async function getWorkflowStatuses(): Promise<WorkflowRunStatusDTO[]> {
  const enumKeys = Object.keys(ProcessInstanceState) as Array<
    keyof typeof ProcessInstanceState
  >;
  const res: WorkflowRunStatusDTO[] = [];
  for (const key of enumKeys) {
    const value = ProcessInstanceState[key];
    res.push({ key: key, value: value });
  }
  return res;
}

function mapToProcessInstanceDTO(
  processInstance: ProcessInstance,
): ProcessInstanceDTO {
  const start = moment(processInstance.start?.toString());
  const end = moment(processInstance.end?.toString());
  const duration = moment.duration(start.diff(end));
  // let variables: Record<string, unknown> | undefined;
  // if (typeof processInstance?.variables === 'string') {
  //   variables = JSON.parse(processInstance?.variables);
  // } else {
  //   variables = processInstance?.variables;
  // }
  return {
    category: mapWorkflowCategoryDTO(processInstance.category),
    description: processInstance.description,
    duration: duration.humanize(),
    id: processInstance.id,
    name: processInstance.processName,
    // To be fixed https://issues.redhat.com/browse/FLPATH-950
    nextWorkflowSuggestions: undefined, // variables?.workflowdata?.workflowOptions,
    started: start.toDate().toLocaleString(),
    status: getProcessInstancesDTOFromString(processInstance.state),
    workflow: processInstance.processName || processInstance.processId,
  };
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

function mapToWorkflowSpecFileDTO(
  specV1: WorkflowSpecFile,
): WorkflowSpecFileDTO {
  if (!specV1.content) {
    throw new Error('Workflow specification content is empty');
  }

  return {
    content: { content: JSON.stringify(specV1.content) },
    path: specV1.path,
  };
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

function mapToExecuteWorkflowResponseDTO(
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
