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
*DefaultApi* | [**getWorkflowInputSchemaById**](Apis/DefaultApi.md#getworkflowinputschemabyid) | **GET** /v2/workflows/{workflowId}/inputSchema | Get the workflow input schema. It defines the input fields of the workflow |
*DefaultApi* | [**getWorkflowInstances**](Apis/DefaultApi.md#getworkflowinstances) | **POST** /v2/workflows/{workflowId}/instances | Get instances for a specific workflow |
*DefaultApi* | [**getWorkflowOverviewById**](Apis/DefaultApi.md#getworkflowoverviewbyid) | **GET** /v2/workflows/{workflowId}/overview | Returns the key fields of the workflow including data on the last run instance |
*DefaultApi* | [**getWorkflowSourceById**](Apis/DefaultApi.md#getworkflowsourcebyid) | **GET** /v2/workflows/{workflowId}/source | Get the workflow's definition |
*DefaultApi* | [**getWorkflowStatuses**](Apis/DefaultApi.md#getworkflowstatuses) | **GET** /v2/workflows/instances/statuses | Get workflow status list |
*DefaultApi* | [**getWorkflowsOverview**](Apis/DefaultApi.md#getworkflowsoverview) | **POST** /v2/workflows/overview | Returns the key fields of the workflow including data on the last run instance |
*DefaultApi* | [**retriggerInstance**](Apis/DefaultApi.md#retriggerinstance) | **POST** /v2/workflows/{workflowId}/{instanceId}/retrigger | Retrigger an instance |


<a name="documentation-for-models"></a>
## Documentation for Models

 - [AssessedProcessInstanceDTO](./Models/AssessedProcessInstanceDTO.md)
 - [ErrorResponse](./Models/ErrorResponse.md)
 - [ExecuteWorkflowRequestDTO](./Models/ExecuteWorkflowRequestDTO.md)
 - [ExecuteWorkflowResponseDTO](./Models/ExecuteWorkflowResponseDTO.md)
 - [FieldFilter](./Models/FieldFilter.md)
 - [FieldFilter_value](./Models/FieldFilter_value.md)
 - [Filter](./Models/Filter.md)
 - [GetInstancesRequest](./Models/GetInstancesRequest.md)
 - [GetOverviewsRequestParams](./Models/GetOverviewsRequestParams.md)
 - [InputSchemaResponseDTO](./Models/InputSchemaResponseDTO.md)
 - [LogicalFilter](./Models/LogicalFilter.md)
 - [NodeInstanceDTO](./Models/NodeInstanceDTO.md)
 - [PaginationInfoDTO](./Models/PaginationInfoDTO.md)
 - [ProcessInstanceDTO](./Models/ProcessInstanceDTO.md)
 - [ProcessInstanceErrorDTO](./Models/ProcessInstanceErrorDTO.md)
 - [ProcessInstanceListResultDTO](./Models/ProcessInstanceListResultDTO.md)
 - [ProcessInstanceStatusDTO](./Models/ProcessInstanceStatusDTO.md)
 - [SearchRequest](./Models/SearchRequest.md)
 - [WorkflowCategoryDTO](./Models/WorkflowCategoryDTO.md)
 - [WorkflowDTO](./Models/WorkflowDTO.md)
 - [WorkflowDataDTO](./Models/WorkflowDataDTO.md)
 - [WorkflowFormatDTO](./Models/WorkflowFormatDTO.md)
 - [WorkflowListResultDTO](./Models/WorkflowListResultDTO.md)
 - [WorkflowOverviewDTO](./Models/WorkflowOverviewDTO.md)
 - [WorkflowOverviewListResultDTO](./Models/WorkflowOverviewListResultDTO.md)
 - [WorkflowProgressDTO](./Models/WorkflowProgressDTO.md)
 - [WorkflowResultDTO](./Models/WorkflowResultDTO.md)
 - [WorkflowResultDTO_nextWorkflows_inner](./Models/WorkflowResultDTO_nextWorkflows_inner.md)
 - [WorkflowResultDTO_outputs_inner](./Models/WorkflowResultDTO_outputs_inner.md)
 - [WorkflowResultDTO_outputs_inner_value](./Models/WorkflowResultDTO_outputs_inner_value.md)
 - [WorkflowRunStatusDTO](./Models/WorkflowRunStatusDTO.md)


<a name="documentation-for-authorization"></a>
## Documentation for Authorization

All endpoints do not require authorization.
