# Openshift Image Registry plugin for Backstage

This plugin will show you all ImageStreams in an Openshift cluster

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-openshift-image-registry
   ```

2. Set the proxy to desired Openshift cluster in the `app-config.yaml` file as follows:

   ```yaml
   # app-config.yaml
   proxy:
     '/openshift-image-registry/api':
     target: <URL where k8s control plane for openshift cluster is running>
     headers:
       X-Requested-With: 'XMLHttpRequest'
       Authorization: Bearer <TOKEN>
     changeOrigin: true
     # Change to "false" in case of using self hosted openshift cluster with a self-signed certificate
     secure: true
   ```

3. Enable additional sidebar-item on the app sidebar

   ```ts
   // packages/app/src/components/Root/Root.tsx
   <SidebarItem
     icon={ExtensionIcon}
     to="openshift-image-registry"
     text="Image Registry"
   />;

   // packages/app/src/App.tsx
   import { OpenshiftImageRegistryPage } from '@janus-idp/backstage-plugin-openshift-image-registry';
   <Route
     path="/openshift-image-registry"
     element={<OpenshiftImageRegistryPage />}
   />;
   ```
