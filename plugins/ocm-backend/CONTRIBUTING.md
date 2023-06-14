# Setting up the development environment for OCM backend plugin

You can run a development setup using the following command:

```console
yarn start
```

When you run the previous command, the Kubernetes API is mocked to provide two clusters: `foo` (works as the hub) and `cluster1`. Also, an error response is mocked for non-existent clusters.
