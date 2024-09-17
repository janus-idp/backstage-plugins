# Documentation for Orchestrator plugin

<a name="documentation-for-api-endpoints"></a>
## Documentation for API Endpoints

All URIs are relative to *http://localhost*

| Class | Method | HTTP request | Description |
|------------ | ------------- | ------------- | -------------|
| *DefaultApi* | [**abortWorkflow**](Apis/DefaultApi.md#abortworkflow) | **DELETE** /v2/workflows/instances/{instanceId}/abort | Abort a workflow instance |
*DefaultApi* | [**executeWorkflow**](Apis/DefaultApi.md#executeworkflow) | **POST** /v2/workflows/{workflowId}/execute | Execute a workflow |
*DefaultApi* | [**getInstanceById**](Apis/DefaultApi.md#getinstancebyid) | **GET** /v2/workflows/instances/{instanceId} | Get Workflow Instance by ID |
*DefaultApi* | [**getInstances**](Apis/DefaultApi.md#getinstances) | **POST** /v2/workflows/instances | Get instances |
*DefaultApi* | [**getWorkflowById**](Apis/DefaultApi.md#getworkflowbyid) | **GET** /v2/workflows/{workflowId} | Get a workflow by ID |
*DefaultApi* | [**getWorkflowInputSchemaById**](Apis/DefaultApi.md#getworkflowinputschemabyid) | **GET** /v2/workflows/{workflowId}/inputSchema | Get a workflow input schema by ID |
*DefaultApi* | [**getWorkflowOverviewById**](Apis/DefaultApi.md#getworkflowoverviewbyid) | **GET** /v2/workflows/{workflowId}/overview | Get a workflow overview by ID |
*DefaultApi* | [**getWorkflowSourceById**](Apis/DefaultApi.md#getworkflowsourcebyid) | **GET** /v2/workflows/{workflowId}/source | Get a workflow source by ID |
*DefaultApi* | [**getWorkflowStatuses**](Apis/DefaultApi.md#getworkflowstatuses) | **GET** /v2/workflows/instances/statuses | Get workflow status list |
*DefaultApi* | [**getWorkflowsOverview**](Apis/DefaultApi.md#getworkflowsoverview) | **POST** /v2/workflows/overview | Get a list of workflow overviews |


<a name="documentation-for-models"></a>
## Documentation for Models

 - [AssessedProcessInstanceDTO](./Models/AssessedProcessInstanceDTO.md)
 - [ErrorResponse](./Models/ErrorResponse.md)
 - [ExecuteWorkflowRequestDTO](./Models/ExecuteWorkflowRequestDTO.md)
 - [ExecuteWorkflowResponseDTO](./Models/ExecuteWorkflowResponseDTO.md)
 - [FilterInfo](./Models/FilterInfo.md)
 - [FilterValue](./Models/FilterValue.md)
 - [GetInstancesRequestParams](./Models/GetInstancesRequestParams.md)
 - [GetOverviewsRequestParams](./Models/GetOverviewsRequestParams.md)
 - [NodeInstanceDTO](./Models/NodeInstanceDTO.md)
 - [Operator](./Models/Operator.md)
 - [PaginationInfoDTO](./Models/PaginationInfoDTO.md)
 - [ProcessInstanceDTO](./Models/ProcessInstanceDTO.md)
 - [ProcessInstanceErrorDTO](./Models/ProcessInstanceErrorDTO.md)
 - [ProcessInstanceListResultDTO](./Models/ProcessInstanceListResultDTO.md)
 - [ProcessInstanceStatusDTO](./Models/ProcessInstanceStatusDTO.md)
 - [WorkflowCategoryDTO](./Models/WorkflowCategoryDTO.md)
 - [WorkflowDTO](./Models/WorkflowDTO.md)
 - [WorkflowDataDTO](./Models/WorkflowDataDTO.md)
 - [WorkflowFormatDTO](./Models/WorkflowFormatDTO.md)
 - [WorkflowListResultDTO](./Models/WorkflowListResultDTO.md)
 - [WorkflowOverviewDTO](./Models/WorkflowOverviewDTO.md)
 - [WorkflowOverviewListResultDTO](./Models/WorkflowOverviewListResultDTO.md)
 - [WorkflowProgressDTO](./Models/WorkflowProgressDTO.md)
 - [WorkflowRunStatusDTO](./Models/WorkflowRunStatusDTO.md)
 - [WorkflowSuggestionDTO](./Models/WorkflowSuggestionDTO.md)


<a name="documentation-for-authorization"></a>
## Documentation for Authorization

All endpoints do not require authorization.
