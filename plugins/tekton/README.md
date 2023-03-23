# Tekton plugin for Backstage

This plugin will help with visualizing the Pipeline Runs and associated Task Runs powering any service on the Kubernetes cluster.

## Prerequisites

1. Install and configure Tekton plugin (only backend plugin) by following https://github.com/jquad-group/backstage-jquad#configuration

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-tekton
   ```

2. Enable an additional tab on the entity view page

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import { TektonPage } from '@janus-idp/backstage-plugin-tekton';

   const serviceEntityPage = (
     <EntityPageLayout>
       // ...
       <EntityLayout.Route path="/pipelines" title="Pipelines">
         <TektonPage />
       </EntityLayout.Route>
     </EntityPageLayout>
   );
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. You can start a live dev session from the repository root using below command:

```
yarn workspace @janus-idp/backstage-plugin-tekton run start
```
