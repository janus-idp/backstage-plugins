# Topology plugin for Backstage

This plugin will help with visualizing the workloads like Deployment, Replicasets, Pods powering any serivce on kubernets cluster.

## Prerequisites

1. Install and configure kubernetes plugin by following these guides:
   https://backstage.io/docs/features/kubernetes/installation
   https://backstage.io/docs/features/kubernetes/configuration
2. Kubernetes plugin is properly configured and able to connect to the cluster via a `ServiceAccount`
3. Following `ClusterRole` must be granted to ServiceAccount accessing the cluster: (k8s plugin by default tries to fetch the following resources and if access is not provided an error is shown)
   ```yaml
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRole
   metadata:
     name: backstage-read-only
   rules:
     - apiGroups:
         - '*'
       resources:
         - pods
         - configmaps
         - services
         - deployments
         - replicasets
         - horizontalpodautoscalers
         - ingresses
         - statefulsets
         - limitranges
         - daemonsets
       verbs:
         - get
         - list
         - watch
     - apiGroups:
         - batch
       resources:
         - jobs
         - cronjobs
       verbs:
         - get
         - list
         - watch
     - apiGroups:
         - metrics.k8s.io
       resources:
         - pods
       verbs:
         - get
         - list
   ```
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
