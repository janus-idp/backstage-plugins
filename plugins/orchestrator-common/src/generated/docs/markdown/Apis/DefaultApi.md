# DefaultApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**abortWorkflow**](DefaultApi.md#abortWorkflow) | **DELETE** /v2/workflows/instances/{instanceId}/abort | Abort a workflow instance |
| [**executeWorkflow**](DefaultApi.md#executeWorkflow) | **POST** /v2/workflows/{workflowId}/execute | Execute a workflow |
| [**getInstanceById**](DefaultApi.md#getInstanceById) | **GET** /v2/workflows/instances/{instanceId} | Get Workflow Instance by ID |
| [**getInstances**](DefaultApi.md#getInstances) | **POST** /v2/workflows/instances | Get instances |
| [**getWorkflowById**](DefaultApi.md#getWorkflowById) | **GET** /v2/workflows/{workflowId} |  |
| [**getWorkflowInputSchemaById**](DefaultApi.md#getWorkflowInputSchemaById) | **GET** /v2/workflows/{workflowId}/inputSchema |  |
| [**getWorkflowOverviewById**](DefaultApi.md#getWorkflowOverviewById) | **GET** /v2/workflows/{workflowId}/overview |  |
| [**getWorkflowSourceById**](DefaultApi.md#getWorkflowSourceById) | **GET** /v2/workflows/{workflowId}/source |  |
| [**getWorkflowStatuses**](DefaultApi.md#getWorkflowStatuses) | **GET** /v2/workflows/instances/statuses | Get workflow status list |
| [**getWorkflowsOverview**](DefaultApi.md#getWorkflowsOverview) | **POST** /v2/workflows/overview |  |


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
> ExecuteWorkflowResponseDTO executeWorkflow(workflowId, ExecuteWorkflowRequestDTO)

Execute a workflow

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow to execute | [default to null] |
| **ExecuteWorkflowRequestDTO** | [**ExecuteWorkflowRequestDTO**](../Models/ExecuteWorkflowRequestDTO.md)|  | |

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
> ProcessInstanceListResultDTO getInstances(GetInstancesRequestParams)

Get instances

    Retrieve an array of instances

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **GetInstancesRequestParams** | [**GetInstancesRequestParams**](../Models/GetInstancesRequestParams.md)| Parameters for retrieving instances | [optional] |

### Return type

[**ProcessInstanceListResultDTO**](../Models/ProcessInstanceListResultDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="getWorkflowById"></a>
# **getWorkflowById**
> WorkflowDTO getWorkflowById(workflowId)



    Get a workflow by ID

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow to fetch | [default to null] |

### Return type

[**WorkflowDTO**](../Models/WorkflowDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="getWorkflowInputSchemaById"></a>
# **getWorkflowInputSchemaById**
> Object getWorkflowInputSchemaById(workflowId, instanceId)



    Get a workflow input schema by ID

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **workflowId** | **String**| ID of the workflow to fetch | [default to null] |
| **instanceId** | **String**| ID of instance | [optional] [default to null] |

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="getWorkflowOverviewById"></a>
# **getWorkflowOverviewById**
> WorkflowOverviewDTO getWorkflowOverviewById(workflowId)



    Get a workflow overview by ID

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



    Get a workflow source by ID

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

    Retrieve an array of workflow statuses

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
> WorkflowOverviewListResultDTO getWorkflowsOverview(GetOverviewsRequestParams)



    Get a list of workflow overviews

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **GetOverviewsRequestParams** | [**GetOverviewsRequestParams**](../Models/GetOverviewsRequestParams.md)| Parameters for retrieving of workflow overviews | [optional] |

### Return type

[**WorkflowOverviewListResultDTO**](../Models/WorkflowOverviewListResultDTO.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

