# Topology plugin for Backstage

The Topology plugin visualizes the workloads such as Deployment, Replicaset, and Pods powering any service on the Kubernetes cluster.

## Prerequisites

- The Kubernetes plugins including `@backstage/plugin-kubernetes` and `@backstage/plugin-kubernetes-backend` are installed and configured by following the [installation](https://backstage.io/docs/features/kubernetes/installation) and [configuration](https://backstage.io/docs/features/kubernetes/configuration) guides.
- The Kubernetes plugin is configured and connects to the cluster using a `ServiceAccount`.
- The [`ClusterRole`](https://backstage.io/docs/features/kubernetes/configuration#role-based-access-control) must be granted to `ServiceAccount` accessing the cluster. If you have the Backstage Kubernetes plugin configured, then the `ClusterRole` is already granted.
- The following annotation is added to the entity's `catalog-info.yaml` file to identify whether an entitiy contains the Kubernetes resources:
  ```yaml
  annotations:
  backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
  ```
  You can also add the `backstage.io/kubernetes-namespace` annotation to identify the Kubernetes resources using the defined namespace.
  ```yaml
  annotations:
    backstage.io/kubernetes-namespace: <RESOURCE_NS>
  ```
- A custom label selector is added, which Backstage uses to find the Kubernetes resources. The label selector takes precedence over the ID annotations.

  `'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`

  ```yaml
  annotations:
  ---
  backstage.io/kubernetes-label-selector: 'app=my-app,component=front-end'
  ```

- The following label is added to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

  ```yaml
  labels:
  ---
  backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>`
  ```

  ***

  **NOTE**

  When using the label selector, the mentioned labels must be present on the resource.

  ***

- The following label is added to display the workload resources such as Deployments and Pods in a visual group:
  ```yaml
  labels:
  ---
  app.kubernetes.io/part-of: <GROUP_NAME>
  ```
- The following annotation is added to display the workload resources such as Deployments and Pods with a visual connector:
  ```yaml
  annotations:
  ---
  app.openshift.io/connects-to: '[{"apiVersion": <RESOURCE_APIVERSION>,"kind": <RESOURCE_KIND>,"name": <RESOURCE_NAME>}]'
  ```

## Using Topology plugin

1. Install the Topology plugin using the following command:

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-topology
   ```

2. Enable **Topology** tab on the entity view page:

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

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Topology plugin is a frontend plugin. You can start a live development session from the repository root using the following command:

```
yarn workspace @janus-idp/backstage-plugin-topology run start
```
