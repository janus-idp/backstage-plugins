# InstancesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**retriggerInstance**](InstancesApi.md#retriggerInstance) | **POST** /v2/instances/{instanceId}/retrigger | Retrigger an instance in error state |


<a name="retriggerInstance"></a>
# **retriggerInstance**
> retriggerInstance_200_response retriggerInstance(instanceId, ExecuteWorkflowRequestDTO)

Retrigger an instance in error state

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **instanceId** | **String**| The ID of the instance to retrigger. | [default to null] |
| **ExecuteWorkflowRequestDTO** | [**ExecuteWorkflowRequestDTO**](../Models/ExecuteWorkflowRequestDTO.md)| Request body to retrigger the instance. | |

### Return type

[**retriggerInstance_200_response**](../Models/retriggerInstance_200_response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

