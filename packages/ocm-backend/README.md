# Open Cluster Management plugin for Backstage

This plugin integrates your Backstage instance with Open Cluster Management.

This is just a part of the plugin, for documentation please refer to [`@janus-idp/backstage-plugin-ocm` documentation](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/ocm).

## Development setup

In order to run a development setup use

```sh
yarn start
```

in this location. This will mock the kubernetes api to provide 2 clusters. A cluster `foo` which is the hub and another cluster `cluster1`. An error response is also mocked for the cluster name `non_existent_cluster`.
