# Open Cluster Management plugin for Backstage

The Open Cluster Management (OCM) plugin integrates your Backstage instance with the `MultiClusterHub` and `MultiCluster` engines of OCM.

## Table of Contents

- [Using the OCM plugin](#using-the-ocm-plugin)
- [Capabilities](#capabilities)
- [Prerequisites](#prerequisites)
  - [Backend Setup](#set-up-the-ocm-backend-package)
    - [Backend Installation](#backend-installation)
    - [Backend Configuration](#backend-configuration)
  - [Frontend Setup](#set-up-the-ocm-frontend-package)
    - [Frontend Installation](#frontend-installation)
  - [Frontend Configuration](#frontend-configuration)
- [Development Setup](#development-setup)

## Using the OCM plugin

The OCM plugin is composed of two packages, including:

- The `@janus-idp/backstage-plugin-ocm-backend` package which connects the Backstage server to OCM.
- The @janus-idp/backstage-plugin-ocm package, which contains frontend components and requires the *-backend package to be present and properly set up. For detailed instructions on setting up the backend, refer to the [Backend Setup](#set-up-the-ocm-backend-package) section.

---

**NOTE**
If you are interested in Resource discovery and do not want any of the frontend components, then you can install and configure the `@janus-idp/backstage-plugin-ocm-backend` package only.

---
## Capabilities

The OCM plugin has the following capabilities:

- All clusters represented as `ManagedCluster` in `MultiClusterHub` or MCE are discovered and imported into the Backstage catalog, such as:
  - Entity is defined as `kind: Resource` with `spec.type` set to `kubernetes-cluster`.
  - Links to the OpenShift Container Platform (OCP) console, OCM console, and OpenShift Cluster Manager are provided in `metadata.links`.
- Shows real-time data from OCM on the Resource entity page, including:
  - Cluster current status (up or down)
  - Cluster details (console link, OCP, and Kubernetes version)
  - Details about available compute resources on the cluster


## Prerequisites

- OCM is deployed and configured on a Kubernetes cluster.
- [Kubernetes plugin for Backstage](https://backstage.io/docs/features/kubernetes) is installed.
- A `ClusterRole` is granted to `ServiceAccount` accessing the hub cluster as follows:

  ```yaml
  kind: ClusterRole
  apiVersion: rbac.authorization.k8s.io/v1
  metadata:
    name: backstage-ocm-plugin
  rules:
    - apiGroups:
        - cluster.open-cluster-management.io
      resources:
        - managedclusters
      verbs:
        - get
        - watch
        - list
    - apiGroups:
        - internal.open-cluster-management.io
      resources:
        - managedclusterinfos
      verbs:
        - get
        - watch
        - list
  ```

### Set up the OCM backend package

#### Backend Installation

1. Install the OCM backend plugin using the following command:

   ```console
   yarn workspace backend add @janus-idp/backstage-plugin-ocm-backend
   ```

#### Backend Configuration

1. Configure the OCM backend plugin using one of the following configurations:

   - The OCM configuration provides the information about your hub. To use the OCM configuration, add the following code to your `app-config.yaml` file:

     ```yaml title="app-config.yaml"
     catalog:
       providers:
         ocm:
           env: # Key is reflected as provider ID. Defines and claims plugin instance ownership of entities
             name: # Name that the hub cluster will assume in Backstage Catalog (in OCM this is always local-cluster which can be confusing)
             url: # Url of the hub cluster API endpoint
             serviceAccountToken: # Token used for querying data from the hub
             skipTLSVerify: # Skip TLS certificate verification, defaults to false
             caData: # Base64-encoded CA bundle in PEM format
     ```

   - If the Backstage Kubernetes plugin is installed and configured to connect to the hub cluster, then you can bind the both hub and Kubernetes configuration by providing the name of the hub in the `app-config.yaml` as follows:

     ```yaml title="app-config.yaml"
     kubernetes:
       serviceLocatorMethod:
         type: 'multiTenant'
       clusterLocatorMethods:
         - type: 'config'
           clusters:
             # highlight-next-line
             - name: <cluster-name>
             # ...

     catalog:
       providers:
         ocm:
           env: # Key is reflected as provider ID. Defines and claims plugin instance ownership of entities
             # highlight-next-line
             kubernetesPluginRef: <cluster-name> # Match the cluster name in kubernetes plugin config
     ```

     Ensure that the Backstage uses a `ServiceAccount` token and the required permissions are granted as mentioned previously.

     This is useful when you already use a Kubernetes plugin in your Backstage instance. Also, the hub cluster must be connected using the `ServiceAccount`.

     For more information about the configuration, see [Backstage Kubernetes plugin](https://backstage.io/docs/features/kubernetes/configuration#configuring-kubernetes-clusters) documentation.

2. Create a new plugin instance in `packages/backend/src/plugins/ocm.ts` file as follows:

   ```ts title="packages/backend/src/plugins/ocm.ts"
   import { createRouter } from '@janus-idp/backstage-plugin-ocm-backend';
   import { Router } from 'express';
   import { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     return await createRouter({
       logger: env.logger,
       config: env.config,
     });
   }
   ```

3. Import and plug the new instance into `packages/backend/src/index.ts` file:

   ```ts title="packages/backend/src/index.ts"
   /* highlight-add-next-line */
   import ocm from './plugins/ocm';

   async function main() {
     // ...
     const createEnv = makeCreateEnv(config);
     // ...
     /* highlight-add-next-line */
     const ocmEnv = useHotMemoize(module, () => createEnv('ocm'));
     // ...
     const apiRouter = Router();
     // ...
     /* highlight-add-next-line */
     apiRouter.use('/ocm', await ocm(ocmEnv));
     // ...
   }
   ```

4. Import the cluster `Resource` entity provider into the `catalog` plugin in the `packages/backend/src/plugins/catalog.ts` file:

   ```ts title="packages/backend/src/plugins/catalog.ts"
   /* highlight-add-next-line */
   import { ManagedClusterProvider } from '@janus-idp/backstage-plugin-ocm-backend';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     const builder = await CatalogBuilder.create(env);
     // ...
     /* highlight-add-start */
     const ocm = ManagedClusterProvider.fromConfig(env.config, {
       logger: env.logger,
     });
     builder.addEntityProvider(ocm);
     /* highlight-add-end */
     // ...

     const { processingEngine, router } = await builder.build();
     await processingEngine.start();
     // ...
     /* highlight-add-start */
     await Promise.all(
       ocm.map(o =>
         env.scheduler.scheduleTask({
           id: `run_ocm_refresh_${o.getProviderName()}`,
           fn: async () => {
             await o.run();
           },
           frequency: { minutes: 30 },
           timeout: { minutes: 10 },
         }),
       ),
     );
     /* highlight-add-end */

     return router;
   }
   ```

5. Optional: Configure the default owner for the cluster entities in the catalog for a specific environment. For example, use the following code to set `foo` as the owner for clusters from `env` in the `app-config.yaml` catalog section:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       ocm:
         env:
           # highlight-next-line
           owner: user:foo
   ```

   For more information about the default owner configuration, see [upstream string references documentation](https://backstage.io/docs/features/software-catalog/references/#string-references).

### Set up the OCM frontend package

#### Frontend Installation

1. Install the OCM frontend plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-ocm
   ```

### Frontend Configuration

1. Select the components that you want to use, such as:

   - `OcmPage`: This is a standalone page or dashboard displaying all clusters as tiles. You can add `OcmPage` to `packages/app/src/App.tsx` file as follows:

     ```tsx title="packages/app/src/App.tsx"
     /* highlight-add-next-line */
     import { OcmPage } from '@janus-idp/backstage-plugin-ocm';

     const routes = (
       <FlatRoutes>
         {/* ... */}
         {/* highlight-add-next-line */}
         <Route path="/ocm" element={<OcmPage logo={<Logo />} />} />
       </FlatRoutes>
     );
     ```

     You can also update navigation in `packages/app/src/components/Root/Root.tsx` as follows:

     ```tsx title="packages/app/src/components/Root/Root.tsx"
     /* highlight-add-next-line */
     import StorageIcon from '@material-ui/icons/Storage';

     export const Root = ({ children }: PropsWithChildren<{}>) => (
       <SidebarPage>
         <Sidebar>
           <SidebarGroup label="Menu" icon={<MenuIcon />}>
             {/* ... */}
             {/* highlight-add-next-line */}
             <SidebarItem icon={StorageIcon} to="ocm" text="Clusters" />
           </SidebarGroup>
           {/* ... */}
         </Sidebar>
         {children}
       </SidebarPage>
     );
     ```

   - `ClusterContextProvider`: This component is a React context provided for OCM data, which is related to the current entity. The `ClusterContextProvider` component is used to display any data on the React components mentioned in `packages/app/src/components/catalog/EntityPage.tsx`:

     ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
     /* highlight-add-start */
     import {
       ClusterAllocatableResourceCard,
       ClusterAvailableResourceCard,
       ClusterContextProvider,
       ClusterInfoCard,
       ClusterStatusCard,
     } from '@janus-idp/backstage-plugin-ocm';
     /* highlight-add-end */

     const isType = (types: string | string[]) => (entity: Entity) => {
       if (!entity?.spec?.type) {
         return false;
       }
       return typeof types === 'string'
         ? entity?.spec?.type === types
         : types.includes(entity.spec.type as string);
     };

     export const resourcePage = (
       <EntityLayout>
         {/* ... */}
         {/* highlight-add-start */}
         <EntityLayout.Route path="/status" title="status">
           <EntitySwitch>
             <EntitySwitch.Case if={isType('kubernetes-cluster')}>
               <ClusterContextProvider>
                 <Grid container>
                   <Grid container item direction="column" xs={3}>
                     <Grid item>
                       <ClusterStatusCard />
                     </Grid>

                     <Grid item>
                       <ClusterAllocatableResourceCard />
                     </Grid>

                     <Grid item>
                       <ClusterAvailableResourceCard />
                     </Grid>
                   </Grid>

                   <Grid item xs>
                     <ClusterInfoCard />
                   </Grid>
                 </Grid>
               </ClusterContextProvider>
             </EntitySwitch.Case>
           </EntitySwitch>
         </EntityLayout.Route>
         {/* highlight-add-end */}
       </EntityLayout>
     );

     export const entityPage = (
       <EntitySwitch>
         {/* ... */}
         {/* highlight-add-next-line */}
         <EntitySwitch.Case if={isKind('resource')} children={resourcePage} />
       </EntitySwitch>
     );
     ```

     In the previous codeblock, you can place the context provider into your `Resource` entity renderer, which is usually available in `packages/app/src/components/catalog/EntityPage.tsx` or in an imported component.

   - `<ClusterStatusCard />`: This is an entity component displaying availability status of a cluster as an overview card:

   - `<ClusterInfoCard />`: This is an entity component displaying details of a cluster in a table:

   - `<ClusterAvailableResourceCard />`: This is an entity component displaying the available resources on a cluster. For example, see [`.status.capacity`](https://open-cluster-management.io/concepts/managedcluster/#cluster-heartbeats-and-status) of the `ManagedCluster` resource.

   - `<ClusterAllocatableResourceCard />`: This is an entity component displaying allocatable resources on a cluster. For example, see [`.status.allocatable`](https://open-cluster-management.io/concepts/managedcluster/#cluster-heartbeats-and-status) of the `ManagedCluster` resource.

## Development Setup

If you have installed the OCM plugin to the example application in the repository, run the `yarn start` command to access the plugin in the root directory and then navigate to `http://localhost:3000/ocm`.

To start a development setup in isolation with a faster setup and hot reloads, complete the following steps:

1. Run the `ocm-backend` plugin in the `plugins/ocm-backend` directory by executing the following command:

   ```console
   yarn start
   ```

2. Run the `ocm` frontend plugin in the `plugins/ocm` directory using the following command:

   ```console
   yarn start
   ```

The previous steps are meant for local development and you can find the setup inside the `./dev` directories of the individual plugins.
