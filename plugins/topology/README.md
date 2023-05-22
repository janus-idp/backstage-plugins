# Topology plugin for Backstage

The Topology plugin visualizes the workloads such as Deployment, Replicaset, and Pods powering any service on the Kubernetes cluster.

## Prerequisites

- The Kubernetes plugins including `@backstage/plugin-kubernetes` and `@backstage/plugin-kubernetes-backend` are installed and configured by following the [installation](https://backstage.io/docs/features/kubernetes/installation) and [configuration](https://backstage.io/docs/features/kubernetes/configuration) guides.
- The Kubernetes plugin is configured and connects to the cluster using a `ServiceAccount`.
- The [`ClusterRole`](https://backstage.io/docs/features/kubernetes/configuration#role-based-access-control) must be granted to `ServiceAccount` accessing the cluster. If you have the Backstage Kubernetes plugin configured, then the `ClusterRole` is already granted.
- The following annotation is added to the entity's `catalog-info.yaml` file to identify whether an entitiy contains the Kubernetes resources:

  ```yaml title="catalog-info.yaml"
  annotations:
  backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
  ```

  You can also add the `backstage.io/kubernetes-namespace` annotation to identify the Kubernetes resources using the defined namespace.

  ```yaml title="catalog-info.yaml"
  annotations:
    backstage.io/kubernetes-namespace: <RESOURCE_NS>
  ```

- A custom label selector is added, which Backstage uses to find the Kubernetes resources. The label selector takes precedence over the ID annotations.

  ```yaml title="catalog-info.yaml"
  annotations:
    backstage.io/kubernetes-label-selector: 'app=my-app,component=front-end'
  ```

- The following label is added to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

  ```yaml title="catalog-info.yaml"
  labels:
    backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>`
  ```

  ***

  **NOTE**

  When using the label selector, the mentioned labels must be present on the resource.

  ***

- The following label is added to display the workload resources such as Deployments and Pods in a visual group:

  ```yaml title="catalog-info.yaml"
  labels:
    app.kubernetes.io/part-of: <GROUP_NAME>
  ```

- The following annotation is added to display the workload resources such as Deployments and Pods with a visual connector:

  ```yaml title="catalog-info.yaml"
  annotations:
    app.openshift.io/connects-to: '[{"apiVersion": <RESOURCE_APIVERSION>,"kind": <RESOURCE_KIND>,"name": <RESOURCE_NAME>}]'
  ```

  For more information about the labels and annotations, see [Guidelines for labels and annotations for OpenShift applications](https://github.com/redhat-developer/app-labels/blob/master/labels-annotation-for-openshift.adoc).

## Using Topology plugin

1. Install the Topology plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-topology
   ```

2. Enable **Topology** tab in `packages/app/src/components/catalog/EntityPage.tsx`:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-next-line */
   import { TopologyPage } from '@janus-idp/backstage-plugin-topology';

   const serviceEntityPage = (
     <EntityPageLayout>
       {/* ... */}
       {/* highlight-add-start */}
       <EntityLayout.Route path="/topology" title="Topology">
         <TopologyPage />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityPageLayout>
   );
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Topology plugin is a frontend plugin. You can start a live development session from the repository root using the following command:

```console
yarn workspace @janus-idp/backstage-plugin-topology run start
```
