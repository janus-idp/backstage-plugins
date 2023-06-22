# Openshift Image Registry plugin for Backstage

The OpenShift Image Registry plugin displays all ImageStreams in an Openshift cluster.

## For administrators

### Installation

Run the following command to install the OpenShift Image Registry plugin:

```console
yarn workspace app add @janus-idp/backstage-plugin-openshift-image-registry
```

### Configuration

1. Set the proxy to desired Openshift cluster in the `app-config.yaml` file as follows:

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

2. Enable an additional sidebar-item on the app sidebar in the `packages/app/src/components/Root/Root.tsx` file:

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

3. Add the Openshift Image Registry page in `packages/app/src/App.tsx` file:

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
