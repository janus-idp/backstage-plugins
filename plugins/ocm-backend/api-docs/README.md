# Documentation for OCM Plugin API

<a name="documentation-for-api-endpoints"></a>

## Documentation for API Endpoints

All URIs are relative to _http://localhost_

| Class        | Method                                                                                  | HTTP request                               | Description                          |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------ |
| _DefaultApi_ | [**statusGet**](Apis/DefaultApi.md#statusget)                                           | **GET** /status                            | Get the status of all clusters       |
| _DefaultApi_ | [**statusProviderIdClusterNameGet**](Apis/DefaultApi.md#statusprovideridclusternameget) | **GET** /status/{providerId}/{clusterName} | Get the status of a specific cluster |

<a name="documentation-for-models"></a>

## Documentation for Models

- [Cluster](./Models/Cluster.md)
- [ClusterBase](./Models/ClusterBase.md)
- [ClusterDetails](./Models/ClusterDetails.md)
- [ClusterDetails_allocatableResources](./Models/ClusterDetails_allocatableResources.md)
- [ClusterDetails_availableResources](./Models/ClusterDetails_availableResources.md)
- [ClusterNodesStatus](./Models/ClusterNodesStatus.md)
- [ClusterOverview](./Models/ClusterOverview.md)
- [ClusterStatus](./Models/ClusterStatus.md)
- [ClusterUpdate](./Models/ClusterUpdate.md)

<a name="documentation-for-authorization"></a>

## Documentation for Authorization

All endpoints do not require authorization.