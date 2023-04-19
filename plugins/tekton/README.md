# Tekton plugin for Backstage

The Tekton plugin helps with visualizing the workloads such as Deployment, Replicaset, and Pods powering any service on the Kubernetes cluster.

## Prerequisites

1. Install and configure the Kubernetes plugin by following the [installation](https://backstage.io/docs/features/kubernetes/installation) and [configuration](https://backstage.io/docs/features/kubernetes/configuration) guides.

2. Add the following `customResources` component in the [app-config.yaml](https://backstage.io/docs/features/kubernetes/configuration#configuring-kubernetes-clusters) file:
   ```yaml
    kubernetes:
      ...
      customResources:
        - group: 'tekton.dev'
          apiVersion: 'v1beta1'
          plural: 'pipelineruns'
        - group: 'tekton.dev'
          apiVersion: 'v1beta1'
          plural: 'taskruns'
   ```
3. The Kubernetes plugin is configured and able to connect to the cluster using a `ServiceAccount`.
4. The `ClusterRole` must be granted for custom resources (pipelineruns and taskruns) to `ServiceAccount` accessing the cluster. If you have the Backstage Kubernetes Plugin configured, the [ClusterRole](https://backstage.io/docs/features/kubernetes/configuration#role-based-access-control) is already granted.
   You can use the following code to grant the `ClusterRole` for custom resources:

   ```yaml
   ---
     apiVersion: rbac.authorization.k8s.io/v1
     kind: ClusterRole
     metadata:
       name: backstage-read-only
     rules:
       ...
       - apiGroups:
           - tekton.dev
         resources:
           - pipelineruns
           - taskruns
         verbs:
           - get
           - list

   ```

5. To get the resources from a Kubernetes cluster, add the following annotations to the entity's `catalog-info.yaml`:

   ```yaml
   annotations:
     backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
     backstage.io/kubernetes-namespace: <RESOURCE_NS>
   ```

   The Kubernetes plugin identifies if the provided entity contains Kubernetes resources and from which namespace the plugin receives the resources based on the previous annotations.

6. You can also add a custom label selector, which Backstage uses to find the resources. The label selector takes precedence over the ID annotation.
   `'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`
7. You must add the following label to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

   ```yaml
   'backstage.io/kubernetes-id': <BACKSTAGE_ENTITY_NAME>`
   ```

   ***

   **NOTE**

   When using the label selector, the mentioned labels must be present on the resource.

   ***

## Using Tekton plugin

1. Install the Tekton plugin using the following command:

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-tekton
   ```

2. Enable additional tab on the entity view page:

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import { TektonPage } from '@janus-idp/backstage-plugin-tekton';

   const serviceEntityPage = (
     <EntityPageLayout>
       // ...
       <EntityLayout.Route path="/tekton" title="Tekton">
         <TektonPage />
       </EntityLayout.Route>
     </EntityPageLayout>
   );
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Tekton plugin is `frontend-plugin`. You can start a live development session from the repository root using the following command:

```
yarn workspace @janus-idp/backstage-plugin-tekton run start
```
