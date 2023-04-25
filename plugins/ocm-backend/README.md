# Open Cluster Management plugin for Backstage

The Open Cluster Management (OCM) plugin integrates your Backstage instance with Open Cluster Management.

For OCM plugin documentation, see [Open Cluster Management plugin documentation](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/ocm) on GitHub.

## Development setup

To run a development setup use the following command:

```sh
yarn start
```

The previous command mocks the Kubernetes API to provide two clusters including cluster `foo` which is the hub and cluster `cluster1`. An error response is also mocked for the cluster named `non_existent_cluster`.
