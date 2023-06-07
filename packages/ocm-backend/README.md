# Open Cluster Management plugin for Backstage

The Open Cluster Management (OCM) plugin integrates your Backstage instance with OCM.

For more information about OCM plugin, see the [Open Cluster Management plugin documentation](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/ocm) on GitHub.

## Development setup

You can run a development setup using the following command:

```console
yarn start
```

When you run the previous command, the Kubernetes API is mocked to provide two clusters: `foo` (works as the hub) and `cluster1`. Also, an error response is mocked for non-existent clusters.
