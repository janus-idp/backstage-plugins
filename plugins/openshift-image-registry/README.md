# Openshift Image Registry plugin for Backstage

This plugin will show you all ImageStreams in an Openshift cluster

## Getting started

1. Install the plugin

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-openshift-image-registry
   ```

2. Set the proxy to desired Openshift cluster in the `app-config.yaml` file as follows:

   ```yaml title="app-config.yaml"
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

3. Enable additional sidebar-item on the app sidebar in `packages/app/src/components/Root/Root.tsx`

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import ExtensionIcon from '@material-ui/icons/Extension';

   export const Root = ({ children }: PropsWithChildren<{}>) => (
     <SidebarPage>
       <Sidebar>
         <SidebarGroup label="Menu" icon={<MenuIcon />}>
           {/* ... */}
           {/* highlight-add-start */}
           <SidebarItem
             icon={ExtensionIcon}
             to="openshift-image-registry"
             text="Image Registry"
           />
           ;{/* highlight-add-end */}
         </SidebarGroup>
         {/* ... */}
       </Sidebar>
       {children}
     </SidebarPage>
   );
   ```

4. Add the Openshift Image Registry Page in `packages/app/src/App.tsx`

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { OpenshiftImageRegistryPage } from '@janus-idp/backstage-plugin-openshift-image-registry';

   const routes = (
     <FlatRoutes>
       {/* ... */}
       {/* highlight-add-start */}
       <Route
         path="/openshift-image-registry"
         element={<OpenshiftImageRegistryPage />}
       />
       {/* highlight-add-end */}
     </FlatRoutes>
   );
   ```
