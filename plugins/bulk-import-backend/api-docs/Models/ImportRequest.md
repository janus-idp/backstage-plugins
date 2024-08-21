# ImportRequest
## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
| **approvalTool** | [**ApprovalTool**](ApprovalTool.md) |  | [optional] [default to null] |
| **catalogEntityName** | **String** | Expected Entity name in the catalog. Relevant only if the &#39;dryRun&#39; query parameter is set to &#39;true&#39;. | [optional] [default to null] |
| **codeOwnersFileAsEntityOwner** | **Boolean** | Whether the CODEOWNERS file will be used as entity owner. Only relevant for dry-run requests. If set to &#39;false&#39;, the corresponding dry-run check will be skipped. | [optional] [default to null] |
| **repository** | [**ImportRequest_repository**](ImportRequest_repository.md) |  | [default to null] |
| **catalogInfoContent** | **String** | content of the catalog-info.yaml to include in the import Pull Request. | [optional] [default to null] |
| **github** | [**ImportRequest_github**](ImportRequest_github.md) |  | [optional] [default to null] |

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

