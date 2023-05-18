# Tekton plugin for Backstage

The Tekton plugin helps with visualizing the `PipelineRun` resources available on the Kubernetes cluster.

## Prerequisites

1. Install and configure the Kubernetes plugin by following the [installation](https://backstage.io/docs/features/kubernetes/installation) and [configuration](https://backstage.io/docs/features/kubernetes/configuration) guides.

2. Add the following `customResources` component in the [app-config.yaml](https://backstage.io/docs/features/kubernetes/configuration#configuring-kubernetes-clusters) file:

   ```yaml title="app-config.yaml"
   kubernetes:
     # ...
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
   apiVersion: rbac.authorization.k8s.io/v1
   kind: ClusterRole
   metadata:
     name: backstage-read-only
   rules:
     # ...
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

   ```yaml title="catalog-info.yaml"
   annotations:
     backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
     backstage.io/kubernetes-namespace: <RESOURCE_NS>
   ```

   The Kubernetes plugin identifies if the provided entity contains Kubernetes resources and from which namespace the plugin receives the resources based on the previous annotations.

6. Add the following annotation to entity's `catalog-info.yaml` file to view the latest `PipelineRun` visualization in the CI/CD tab of the application:

   ```yaml title="catalog-info.yaml"
   annotations:
     # ...
     janus-idp.io/tekton-enabled: 'true'
   ```

7. You can also add a custom label selector, which Backstage uses to find the resources. The label selector takes precedence over the ID annotation.
   `'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`
8. You must add the following label to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

   ```yaml title="catalog-info.yaml"
   'backstage.io/kubernetes-id': <BACKSTAGE_ENTITY_NAME>`
   ```

   ***

   **NOTE**

   When using the label selector, the mentioned labels must be present on the resource.

   ***

## Using Tekton plugin

1. Install the Tekton plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-tekton
   ```

2. Enable additional tab on the entity view page in `packages/app/src/components/catalog/EntityPage.tsx`:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-next-line */
   import { TektonPage } from '@janus-idp/backstage-plugin-tekton';

   const serviceEntityPage = (
     <EntityPageLayout>
       {/* ... */}
       {/* highlight-add-start */}
       <EntityLayout.Route path="/tekton" title="Tekton">
         <TektonPage />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityPageLayout>
   );
   ```

3. Enable latest PipelineRun visualization in the CI/CD tab in `packages/app/src/components/catalog/EntityPage.tsx`. The `linkTekton` prop is optional and takes boolean value, if not specified or set to `true`, then the `GO TO TEKTON` is shown.

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-next-line */
   import { LatestPipelineRun, isTektonCIAvailable } from '@janus-idp/backstage-plugin-tekton';

   const cicdContent = (
     <EntitySwitch>>
       {/* ... */}
       {/* highlight-add-start */}
       <EntitySwitch.Case if={isTektonCIAvailable}>
         <LatestPipelineRun linkTekton />
       </EntitySwitch.Case>
       {/* highlight-add-end */}
     </EntitySwitch>
   );
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), the Tekton plugin is a frontend plugin. You can start a live development session from the repository root using the following command:

```console
yarn workspace @janus-idp/backstage-plugin-tekton run start
```
