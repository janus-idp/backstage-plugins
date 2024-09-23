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
> ImportJobList findAllImports(page, size, search)

Fetch Import Jobs

### Parameters

|Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **page** | **Integer**| the requested page number | [optional] [default to 1] |
| **size** | **Integer**| the maximum number of items to return per page | [optional] [default to 20] |
| **search** | **String**| returns only Imports that contain the search string, by repository name | [optional] [default to null] |

### Return type

[**ImportJobList**](../Models/ImportJobList.md)

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

