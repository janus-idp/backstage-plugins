# RepositoryApi

All URIs are relative to *http://localhost:7007/api/bulk-import-backend*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**findAllRepositories**](RepositoryApi.md#findAllRepositories) | **GET** /repositories | Fetch Organization Repositories accessible by Backstage Github Integrations |


<a name="findAllRepositories"></a>
# **findAllRepositories**
> RepositoryList findAllRepositories(checkImportStatus, pagePerIntegration, sizePerIntegration)

Fetch Organization Repositories accessible by Backstage Github Integrations

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **checkImportStatus** | **Boolean**| whether to return import status. Note that this might incur a performance penalty because the import status is computed for each repository. | [optional] [default to false] |
| **pagePerIntegration** | **Integer**| the page number for each Integration | [optional] [default to 1] |
| **sizePerIntegration** | **Integer**| the number of items per Integration to return per page | [optional] [default to 20] |

### Return type

[**RepositoryList**](../Models/RepositoryList.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

