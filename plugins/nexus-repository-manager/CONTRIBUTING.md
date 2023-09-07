# Setting up the development environment for Nexus Repository Manager plugin

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Nexus Repository Manager plugin is a front-end plugin. You can start a live development session from the repository root using the following command (only works from the root directory):

```console
yarn start --filter=@janus-idp/backstage-plugin-nexus-repository-manager
```

Alternatively, you can run the following commands from any directory in the repository:

```console
yarn workspace @janus-idp/backstage-plugin-nexus-repository-manager generate
yarn workspace @janus-idp/backstage-plugin-nexus-repository-manager run start
```
