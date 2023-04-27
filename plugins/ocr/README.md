# OCR plugin for Backstage

This plugin will show you information about your container images within Quay registry

## Prerequisites

1. Install and configure Kubernetes plugin by following these guides:
   https://backstage.io/docs/features/kubernetes/installation
   https://backstage.io/docs/features/kubernetes/configuration
2. Add below customResources in [app-config.yaml](https://backstage.io/docs/features/kubernetes/configuration#configuring-kubernetes-clusters)
   ```yaml
    kubernetes:
      ...
      customResources:
        - group: 'image.openshift.io'
          apiVersion: 'v1'
          plural: 'imagestreams'
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
           - image.openshift.io
         resources:
           - imagestreams
         verbs:
           - get
           - list

   ```
## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-ocr
   ```

2. Add to `packages/app/src/App.tsx`:

   ```diff
   + import { OcrPage } from '@janus-idp/backstage-plugin-ocr';

     const routes = (
       <FlatRoutes>
         ...
   +     <Route path="/ocr" element={<OcrPage />} />
         ...
       </FlatRoutes>
     );
   ```

## Development

In [Backstage plugin terminology](https://backstage.io/docs/local-dev/cli-build-system#package-roles), this is a `frontend-plugin`. However it requires backend proxy to be available at all times. Development environment therefore requires you to run a backend instance as well. You can start a live dev session from the repository root using following commands concurrently:

```
yarn start-backend
```

```
yarn workspace @janus-idp/backstage-plugin-ocr run start
```
