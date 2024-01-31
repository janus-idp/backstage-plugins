# OpenShift Image Registry plugin for Backstage

The OpenShift Image Registry plugin displays all ImageStreams in an Openshift cluster.

## For administrators

### Prerequisites

The OpenShift Image Registry plugin requires read access to **_all_** `ImageStreams` and `ImageStreamTags` on a cluster. (Currently only a single cluster is supported.)

You can create a `ServiceAccount`, `ClusterRole` and `ClusterRoleBinding` with this commands.

Please notice that the ServiceAccount will be created in your current namespace while the `ClusterRole` and `ClusterRoleBinding` giving access to all namespaces are cluster-wide resources.

Additional information on these commands could be found in the [OpenShift Container Platform authentication and authorization documentation](https://docs.openshift.com/container-platform/latest/authentication/index.html).

```console
oc create serviceaccount janus-idp-openshift-image-registry-reader

oc create clusterrole janus-idp-openshift-image-registry-reader --verb=get,watch,list --resource=imagestreams --resource=imagestreamtags

oc adm policy add-cluster-role-to-user janus-idp-openshift-image-registry-reader -z janus-idp-openshift-image-registry-reader
```

And finally you can use this command to create a token that is valid for one week:

```console
oc create token --duration=168h janus-idp-openshift-image-registry-reader
```

### Installation

Run the following command to install the OpenShift Image Registry plugin:

```console
yarn workspace app add @janus-idp/backstage-plugin-openshift-image-registry
```

### Configuration

1. Set the proxy to desired OpenShift cluster in the `app-config.yaml` file as follows:

   ```yaml title="app-config.yaml"
   proxy:
     endpoints:
       '/openshift-image-registry/api':
       target: <URL where k8s control plane for OpenShift cluster is running>
       headers:
         X-Requested-With: 'XMLHttpRequest'
         Authorization: Bearer <TOKEN>
       changeOrigin: true
       # Change to "false" in case of using self hosted OpenShift cluster with a self-signed certificate
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
           {/* highlight-add-end */}
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
