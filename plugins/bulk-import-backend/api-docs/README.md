# Documentation for Bulk Import Backend

<a name="documentation-for-api-endpoints"></a>
## Documentation for API Endpoints

All URIs are relative to *http://localhost:7007/api/bulk-import-backend*

| Class | Method | HTTP request | Description |
|------------ | ------------- | ------------- | -------------|
| *ImportApi* | [**createImportJobs**](Apis/ImportApi.md#createimportjobs) | **POST** /imports | Submit Import Jobs |
*ImportApi* | [**deleteImportByRepo**](Apis/ImportApi.md#deleteimportbyrepo) | **DELETE** /import/by-repo | Delete Import by repository |
*ImportApi* | [**findAllImports**](Apis/ImportApi.md#findallimports) | **GET** /imports | Fetch Import Jobs |
*ImportApi* | [**findImportStatusByRepo**](Apis/ImportApi.md#findimportstatusbyrepo) | **GET** /import/by-repo | Get Import Status by repository |
| *ManagementApi* | [**ping**](Apis/ManagementApi.md#ping) | **GET** /ping | Check the health of the Bulk Import backend router |
| *RepositoryApi* | [**findAllRepositories**](Apis/RepositoryApi.md#findallrepositories) | **GET** /repositories | Fetch Organization Repositories accessible by Backstage Github Integrations |


<a name="documentation-for-models"></a>
## Documentation for Models

 - [ApprovalTool](./Models/ApprovalTool.md)
 - [Import](./Models/Import.md)
 - [ImportRequest](./Models/ImportRequest.md)
 - [ImportRequest_github](./Models/ImportRequest_github.md)
 - [ImportRequest_github_pullRequest](./Models/ImportRequest_github_pullRequest.md)
 - [ImportRequest_repository](./Models/ImportRequest_repository.md)
 - [ImportStatus](./Models/ImportStatus.md)
 - [Import_github](./Models/Import_github.md)
 - [Import_github_pullRequest](./Models/Import_github_pullRequest.md)
 - [Import_repository](./Models/Import_repository.md)
 - [Repository](./Models/Repository.md)
 - [RepositoryList](./Models/RepositoryList.md)
 - [ping_200_response](./Models/ping_200_response.md)


<a name="documentation-for-authorization"></a>
## Documentation for Authorization

<a name="BearerAuth"></a>
### BearerAuth

- **Type**: HTTP Bearer Token authentication (JWT)

