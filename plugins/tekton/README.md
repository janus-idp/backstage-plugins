# Tekton plugin for Backstage

This plugin will help with visualizing the workloads like Deployment, Replicaset and Pods powering any service on the Kubernetes cluster.

## Prerequisites

1. Install and configure Kubernetes plugin by following these guides:
   https://backstage.io/docs/features/kubernetes/installation
   https://backstage.io/docs/features/kubernetes/configuration
2. Add below customResources in [app-config.yaml](https://backstage.io/docs/features/kubernetes/configuration#configuring-kubernetes-clusters)
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
3. Kubernetes plugin is properly configured and able to connect to the cluster via a `ServiceAccount`
4. Below ClusterRole must be granted for custom resources (pipelineruns and taskruns) to ServiceAccount accessing the cluster. [ClusterRole](https://backstage.io/docs/features/kubernetes/configuration#role-based-access-control) is already granted if you have the Backstage Kubernetes Plugin properly configured,

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

5. To get the resources from a k8s cluster add the following annotations to the entity's catalog-info.yaml as K8s plugin identifies if the provided entity has k8s resources and if yes from which namespace it should get the resources based on the following annotations.
   ```yaml
   annotations:
     backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
     backstage.io/kubernetes-namespace: <RESOURCE_NS>
   ```
6. To view the latest PipelineRun visualization in the CI/CD tab of the application, add the below annotation.
   ```yaml
   annotations:
     ...
     janus-idp.io/tekton-enabled : 'true'
   ```
7. A custom label selector can also be added which will then be used by Backstage to find the resources. The label selector takes precedence over the id annotation.
   `'backstage.io/kubernetes-label-selector': 'app=my-app,component=front-end`
8. For k8s plugin to get the desired entity's k8s resources the following label should be added to the resources(if label selector is used then the labels mentioned in that should be present on the resource):
   ```yaml
   'backstage.io/kubernetes-id': <BACKSTAGE_ENTITY_NAME>`
   ```

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-tekton
   ```

2. Enable additional tab on the entity view page

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

3. Enable latest PipelineRun visualization in the CI/CD tab on the entity view page. The `linkTekton` prop is optional and takes boolen value, if not specified or set to `true`, then the `GO TO TEKTON` is shown.

   ```ts
   // packages/app/src/components/catalog/EntityPage.tsx
   import { LatestPipelineRun, isTektonCIAvailable } from '@janus-idp/backstage-plugin-tekton';

   const cicdContent = (
     <EntitySwitch>>
       // ...
      <EntitySwitch.Case if={isTektonCIAvailable}>
        <LatestPipelineRun linkTekton />
      </EntitySwitch.Case>
     </EntitySwitch>
   );
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. You can start a live dev session from the repository root using below command:

```
yarn workspace @janus-idp/backstage-plugin-tekton run start
```
