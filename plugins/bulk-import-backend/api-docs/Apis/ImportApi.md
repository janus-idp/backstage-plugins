# ImportApi

All URIs are relative to *http://localhost:7007/api/bulk-import*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createImportJobs**](ImportApi.md#createImportJobs) | **POST** /imports | Submit Import Jobs |
| [**deleteImportByRepo**](ImportApi.md#deleteImportByRepo) | **DELETE** /import/by-repo | Delete Import by repository |
| [**findAllImports**](ImportApi.md#findAllImports) | **GET** /imports | Fetch Import Jobs |
| [**findImportStatusByRepo**](ImportApi.md#findImportStatusByRepo) | **GET** /import/by-repo | Get Import Status by repository |


<a name="createImportJobs"></a>
# **createImportJobs**
> List createImportJobs(ImportRequest, dryRun)

Submit Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ImportRequest** | [**List**](../Models/ImportRequest.md)| List of Import jobs to create | |
| **dryRun** | **Boolean**| whether to perform a dry-run to check if entity name collisions would occur in the catalog | [optional] [default to false] |

### Return type

[**List**](../Models/Import.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

<a name="deleteImportByRepo"></a>
# **deleteImportByRepo**
> deleteImportByRepo(repo, defaultBranch)

Delete Import by repository

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **repo** | **String**| the full URL to the repo | [optional] [default to null] |
| **defaultBranch** | **String**| the name of the default branch | [optional] [default to main] |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

<a name="findAllImports"></a>
# **findAllImports**
> findAllImports_200_response findAllImports(api-version, pagePerIntegration, sizePerIntegration, page, size, search)

Fetch Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **api-version** | **String**| API version.  ## Changelog  ### v1 (default) Initial version #### Deprecations * GET /imports   * Deprecation of &#39;pagePerIntegration&#39; and &#39;sizePerIntegration&#39; query parameters and introduction of new &#39;page&#39; and &#39;size&#39; parameters     * &#39;page&#39; takes precedence over &#39;pagePerIntegration&#39; if both are passed     * &#39;size&#39; takes precedence over &#39;sizePerIntegration&#39; if both are passed  ### v2 #### Breaking changes * GET /imports   * Query parameters:     * &#39;pagePerIntegration&#39; is ignored in favor of &#39;page&#39;     * &#39;sizePerIntegration&#39; is ignored in favor of &#39;size&#39;   * Response structure changed to include pagination info: instead of returning a simple list of Imports, the response is now an object containing the following fields:     * &#39;imports&#39;: the list of Imports     * &#39;page&#39;: the page requested     * &#39;size&#39;: the requested number of Imports requested per page     * &#39;totalCount&#39;: the total count of Imports  | [optional] [default to v1] [enum: v1, v2] |
| **pagePerIntegration** | **Integer**| the page number for each Integration. **Deprecated**. Use the &#39;page&#39; query parameter instead. | [optional] [default to 1] |
| **sizePerIntegration** | **Integer**| the number of items per Integration to return per page. **Deprecated**. Use the &#39;size&#39; query parameter instead. | [optional] [default to 20] |
| **page** | **Integer**| the requested page number | [optional] [default to 1] |
| **size** | **Integer**| the number of items to return per page | [optional] [default to 20] |
| **search** | **String**| returns only the items that match the search string | [optional] [default to null] |

### Return type

[**findAllImports_200_response**](../Models/findAllImports_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

<a name="findImportStatusByRepo"></a>
# **findImportStatusByRepo**
> Import findImportStatusByRepo(repo, defaultBranch)

Get Import Status by repository

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **repo** | **String**| the full URL to the repo | [optional] [default to null] |
| **defaultBranch** | **String**| the name of the default branch | [optional] [default to main] |

### Return type

[**Import**](../Models/Import.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

