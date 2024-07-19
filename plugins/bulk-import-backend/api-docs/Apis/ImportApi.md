# ImportApi

All URIs are relative to *http://localhost:7007/api/bulk-import-backend*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createImportJobs**](ImportApi.md#createImportJobs) | **POST** /imports | Submit Import Jobs |
| [**deleteImportByRepo**](ImportApi.md#deleteImportByRepo) | **DELETE** /import/by-repo | Delete Import by repository |
| [**findAllImports**](ImportApi.md#findAllImports) | **GET** /imports | Fetch Import Jobs |
| [**findImportStatusByRepo**](ImportApi.md#findImportStatusByRepo) | **GET** /import/by-repo | Get Import Status by repository |


<a name="createImportJobs"></a>
# **createImportJobs**
> List createImportJobs(ImportRequest)

Submit Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ImportRequest** | [**List**](../Models/ImportRequest.md)| List of Import jobs to create | |

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
> List findAllImports(pagePerIntegration, sizePerIntegration)

Fetch Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **pagePerIntegration** | **Integer**| the page number for each Integration | [optional] [default to 1] |
| **sizePerIntegration** | **Integer**| the number of items per Integration to return per page | [optional] [default to 20] |

### Return type

[**List**](../Models/Import.md)

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

