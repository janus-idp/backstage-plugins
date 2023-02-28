# Topology plugin for Backstage

This plugin will help with visualizing the workloads like Deployment, Replicaset and Pods powering any service on the Kubernetes cluster.

## Prerequisites

1. Install and configure Kubernetes plugin by following these guides:
   https://backstage.io/docs/features/kubernetes/installation
   https://backstage.io/docs/features/kubernetes/configuration
2. Kubernetes plugin is properly configured and able to connect to the cluster via a `ServiceAccount`
3. Following [ClusterRole](https://backstage.io/docs/features/kubernetes/configuration#role-based-access-control) must be granted to ServiceAccount accessing the cluster (This role is already granted if you have the Backstage Kubernetes Plugin properly configured)
4. To get the resources from a k8s cluster add the following annotations to the entity's catalog-info.yaml as K8s plugin identifies if the provided entity has k8s resources and if yes from which namespace it should get the resources based on the following annotations.
   ```yaml
   annotations:
     backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
     backstage.io/kubernetes-namespace: <RESOURCE_NS>
   ```
5. A custom label selector can also be added which will then be used by Backstage to find the resources. The label selector takes precedence over the id annotation.
   `'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`
6. For k8s plugin to get the desired entity's k8s resources the following label should be added to the resources(if label selector is used then the labels mentioned in that should be present on the resource):
   ```yaml
   'backstage.io/kubernetes-id': <BACKSTAGE_ENTITY_NAME>`
   ```
7. Workload resources like Deployments and Pods will be shown in a visual group based on below label
   ```yaml
   'app.kubernetes.io/part-of': <GROUP_NAME>
   ```
8. Workload resources like Deployment or Pod will be shown with a visual connector based on below annotations
   ```yaml
   'app.openshift.io/connects-to': '[{"apiVersion": <RESOURCE_APIVERSION>,"kind": <RESOURCE_KIND>,"name": <RESOURCE_NAME>}]'
   ```

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

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires k8s backend plugin to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```
yarn start-backend
```

```
yarn workspace @janus-idp/backstage-plugin-topology run start
```
