# Topology plugin for Backstage

The Topology plugin helps with visualizing the workloads such as Deployment, Replicaset, and Pods powering any service on the Kubernetes cluster.

## Prerequisites

1. Install and configure the Kubernetes plugin by following the [installation](https://backstage.io/docs/features/kubernetes/installation) and [configuration](https://backstage.io/docs/features/kubernetes/configuration) guides.
2. The Kubernetes plugin is configured and able to connect to the cluster using a `ServiceAccount`.
3. The [`ClusterRole`](https://backstage.io/docs/features/kubernetes/configuration#role-based-access-control) must be granted to `ServiceAccount` accessing the cluster. If you have the Backstage Kubernetes plugin configured, then the `ClusterRole` is already granted.
4. To receive the resources from a Kubernetes cluster, add the following annotations to the entity's `catalog-info.yaml` file:

   ```yaml
   annotations:
     backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
     backstage.io/kubernetes-namespace: <RESOURCE_NS>
   ```

   The Kubernetes plugin identifies if the provided entity contains Kubernetes resources and from which namespace the plugin receives the resources based on the previous annotations.

5. You can also add a custom label selector, which Backstage uses to find the resources. The label selector takes precedence over the ID annotation.
   `'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`
6. You must add the following label to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

   ```yaml
   'backstage.io/kubernetes-id': <BACKSTAGE_ENTITY_NAME>`
   ```

   ***

   **NOTE**

   When using the label selector, the mentioned labels must be present on the resource.

   ***

7. The workload resources such as Deployments and Pods are displayed in a visual group based on the following label:
   ```yaml
   'app.kubernetes.io/part-of': <GROUP_NAME>
   ```
8. The workload resources such as Deployment or Pod are displayed with a visual connector based on the following annotations:
   ```yaml
   'app.openshift.io/connects-to': '[{"apiVersion": <RESOURCE_APIVERSION>,"kind": <RESOURCE_KIND>,"name": <RESOURCE_NAME>}]'
   ```

## Using Topology plugin

1. Install the Topology plugin using the following command:

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-topology
   ```

2. Enable additional tab on the entity view page:

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
