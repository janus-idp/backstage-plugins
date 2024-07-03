# OrganizationApi

All URIs are relative to *http://localhost:7007/api/bulk-import-backend*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**findAllOrganizations**](OrganizationApi.md#findAllOrganizations) | **GET** /organizations | Fetch Organizations accessible by Backstage Github Integrations |
| [**findRepositoriesByOrganization**](OrganizationApi.md#findRepositoriesByOrganization) | **GET** /organizations/{organizationName}/repositories | Fetch Repositories in the specified GitHub organization, provided it is accessible by any of the configured GitHub Integrations. |


<a name="findAllOrganizations"></a>
# **findAllOrganizations**
> OrganizationList findAllOrganizations(pagePerIntegration, sizePerIntegration)

Fetch Organizations accessible by Backstage Github Integrations

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **pagePerIntegration** | **Integer**| the page number for each Integration | [optional] [default to 1] |
| **sizePerIntegration** | **Integer**| the number of items per Integration to return per page | [optional] [default to 20] |

### Return type

[**OrganizationList**](../Models/OrganizationList.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="findRepositoriesByOrganization"></a>
# **findRepositoriesByOrganization**
> RepositoryList findRepositoriesByOrganization(organizationName, checkImportStatus, pagePerIntegration, sizePerIntegration)

Fetch Repositories in the specified GitHub organization, provided it is accessible by any of the configured GitHub Integrations.

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **organizationName** | **String**| Organization name | [default to null] |
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

