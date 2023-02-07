# Topology plugin for Backstage

This plugin will help with visualizing the workloads like Deployment, Replicasets, Pods powering any serivce on kubernets cluster.

## Prerequisites

2. Installed [Kubernetes backend plugin for Backstage](https://github.com/backstage/backstage/tree/master/plugins/kubernetes-backend)
3. Kubernetes plugin is properly configured

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-topology
   ```

2. Enable additional tab on the entity view page

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import { TopologyPage } from '@janus-idp/backstage-plugin-topology';

   const serviceEntityPage = (
     <EntityPageLayout>
       // ...
       <EntityLayout.Route path="/topology" title="Topology">
         <TopologyPage />
       </EntityLayout.Route>
     </EntityPageLayout>
   );
   ```

3. Annotate your entity with

   ```yaml
   metadata:
     annotations:
       'backstage.io/kubernetes-id': `<BACKSTAGE_ENTITY_NAME>`
   ```

For k8s plugin to get the desired entity's k8s resources the following label should be added to the resources

```yaml
'backstage.io/kubernetes-id': <BACKSTAGE_ENTITY_NAME>`
```

K8s plugin identifies if the provided entity has k8s resources and if yes from which namespace it should get the resources based on the following annotations added to the entity's catalog-info.yaml

A custom label selector can also be added which will then be used by Backstage to find the resources. The label selector takes precedence over the id annotation.

```yaml
  'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`
```

In order to use k8s plugin to get the resources for Topology view, the above annotations/labels should be in place.

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires k8s backend plugin to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```
yarn start-backend
```

```
yarn workspace @janus-idp/backstage-plugin-topology run start
```
