# Openshift Image Registry plugin for Backstage

This plugin will show you all images and its tags in internal registry of openshift

## Getting started

1. Install the plugin

   ```bash
   yarn workspace app add @janus-idp/backstage-plugin-openshift-image-registry
   ```

2. Set the proxy to desired Openshift instance server

   ```yaml
   # app-config.yaml
   proxy:
     '/openshift-image-registry/api':
     target: <URL where KCP is running>
     headers:
       X-Requested-With: 'XMLHttpRequest'
       # Uncomment the following line to access a private Quay Repository using a token
       Authorization: Bearer <TOKEN>
     changeOrigin: true
     # Change to "false" in case of using self hosted quay instance with a self-signed certificate
     secure: false
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
