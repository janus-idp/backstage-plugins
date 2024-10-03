# WorkflowResultDTO
## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
| **completedWith** | **String** | The state of workflow completion. | [optional] [default to null] |
| **message** | **String** | High-level summary of the current status, free-form text, human readable. | [optional] [default to null] |
| **nextWorkflows** | [**List**](WorkflowResultDTO_nextWorkflows_inner.md) | List of workflows suggested to run next. Items at lower indexes are of higher priority. | [optional] [default to null] |
| **outputs** | [**List**](WorkflowResultDTO_outputs_inner.md) | Additional structured output of workflow processing. This can contain identifiers of created resources, links to resources, logs or other output. | [optional] [default to null] |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

