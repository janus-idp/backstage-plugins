# DefaultApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**abortWorkflow**](DefaultApi.md#abortWorkflow) | **DELETE** /v2/workflows/instances/{instanceId}/abort | Abort a workflow instance |
| [**executeWorkflow**](DefaultApi.md#executeWorkflow) | **POST** /v2/workflows/{workflowId}/execute | Execute a workflow |
| [**getInstanceById**](DefaultApi.md#getInstanceById) | **GET** /v2/workflows/instances/{instanceId} | Get Workflow Instance by ID |
| [**getInstances**](DefaultApi.md#getInstances) | **POST** /v2/workflows/instances | Get instances |
| [**getWorkflowInputSchemaById**](DefaultApi.md#getWorkflowInputSchemaById) | **GET** /v2/workflows/{workflowId}/inputSchema |  |
| [**getWorkflowInstances**](DefaultApi.md#getWorkflowInstances) | **POST** /v2/workflows/{workflowId}/instances | Get instances for a specific workflow |
| [**getWorkflowOverviewById**](DefaultApi.md#getWorkflowOverviewById) | **GET** /v2/workflows/{workflowId}/overview |  |
| [**getWorkflowSourceById**](DefaultApi.md#getWorkflowSourceById) | **GET** /v2/workflows/{workflowId}/source |  |
| [**getWorkflowStatuses**](DefaultApi.md#getWorkflowStatuses) | **GET** /v2/workflows/instances/statuses | Get workflow status list |
| [**getWorkflowsOverview**](DefaultApi.md#getWorkflowsOverview) | **POST** /v2/workflows/overview |  |
| [**retriggerInstance**](DefaultApi.md#retriggerInstance) | **POST** /v2/workflows/{workflowId}/{instanceId}/retrigger | Retrigger an instance |


<a name="abortWorkflow"></a>
# **abortWorkflow**
> String abortWorkflow(instanceId)

Abort a workflow instance

    Aborts a workflow instance identified by the provided instanceId.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **instanceId** | **String**| The identifier of the workflow instance to abort. | [default to null] |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/plain, application/json

<a name="executeWorkflow"></a>
# **executeWorkflow**
> ExecuteWorkflowResponseDTO executeWorkflow(workflowId, ExecuteWorkflowRequestDTO, businessKey)

Execute a workflow

    Execute a workflow

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow to execute | [default to null] |
| **ExecuteWorkflowRequestDTO** | [**ExecuteWorkflowRequestDTO**](../Models/ExecuteWorkflowRequestDTO.md)|  | |
| **businessKey** | **String**| ID of the parent workflow | [optional] [default to null] |

### Return type

[**ExecuteWorkflowResponseDTO**](../Models/ExecuteWorkflowResponseDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="getInstanceById"></a>
# **getInstanceById**
> AssessedProcessInstanceDTO getInstanceById(instanceId, includeAssessment)

Get Workflow Instance by ID

    Get a workflow execution/run (instance)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **instanceId** | **String**| ID of the workflow instance | [default to null] |
| **includeAssessment** | **Boolean**| Whether to include assessment | [optional] [default to false] |

### Return type

[**AssessedProcessInstanceDTO**](../Models/AssessedProcessInstanceDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="getInstances"></a>
# **getInstances**
> ProcessInstanceListResultDTO getInstances(GetInstancesRequest)

Get instances

    Retrieve an array of workflow executions (instances)

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **GetInstancesRequest** | [**GetInstancesRequest**](../Models/GetInstancesRequest.md)| Parameters for retrieving instances | [optional] |

### Return type

[**ProcessInstanceListResultDTO**](../Models/ProcessInstanceListResultDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="getWorkflowInputSchemaById"></a>
# **getWorkflowInputSchemaById**
> InputSchemaResponseDTO getWorkflowInputSchemaById(workflowId, instanceId)



    Get the workflow input schema. It defines the input fields of the workflow

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow to fetch | [default to null] |
| **instanceId** | **String**| ID of instance | [optional] [default to null] |

### Return type

[**InputSchemaResponseDTO**](../Models/InputSchemaResponseDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="getWorkflowInstances"></a>
# **getWorkflowInstances**
> ProcessInstanceListResultDTO getWorkflowInstances(workflowId, SearchRequest)

Get instances for a specific workflow

    Retrieve an array of workflow executions (instances) for the given workflow

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow | [default to null] |
| **SearchRequest** | [**SearchRequest**](../Models/SearchRequest.md)| Parameters for retrieving workflow instances | [optional] |

### Return type

[**ProcessInstanceListResultDTO**](../Models/ProcessInstanceListResultDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="getWorkflowOverviewById"></a>
# **getWorkflowOverviewById**
> WorkflowOverviewDTO getWorkflowOverviewById(workflowId)



    Returns the key fields of the workflow including data on the last run instance

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| Unique identifier of the workflow | [default to null] |

### Return type

[**WorkflowOverviewDTO**](../Models/WorkflowOverviewDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="getWorkflowSourceById"></a>
# **getWorkflowSourceById**
> String getWorkflowSourceById(workflowId)



    Get the workflow&#39;s definition

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow to fetch | [default to null] |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: text/plain, application/json

<a name="getWorkflowStatuses"></a>
# **getWorkflowStatuses**
> List getWorkflowStatuses()

Get workflow status list

    Retrieve array with the status of all instances

### Parameters
This endpoint does not need any parameter.

### Return type

[**List**](../Models/WorkflowRunStatusDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="getWorkflowsOverview"></a>
# **getWorkflowsOverview**
> WorkflowOverviewListResultDTO getWorkflowsOverview(SearchRequest)



    Returns the key fields of the workflow including data on the last run instance

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **SearchRequest** | [**SearchRequest**](../Models/SearchRequest.md)| Pagination and filters | [optional] |

### Return type

[**WorkflowOverviewListResultDTO**](../Models/WorkflowOverviewListResultDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="retriggerInstance"></a>
# **retriggerInstance**
> Object retriggerInstance(workflowId, instanceId)

Retrigger an instance

    Retrigger an instance

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow | [default to null] |
| **instanceId** | **String**| ID of the instance to retrigger | [default to null] |

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

