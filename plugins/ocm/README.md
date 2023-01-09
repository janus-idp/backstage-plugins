# Open Cluster Management plugin for Backstage

This plugin integrates your Backstage instance with Open Cluster Management's MultiClusterHub and MultiCluster Engine.

## Prerequisites

1. OCM deployed and configured on a kubernetes cluster
2. Installed [Kubernetes plugin for Backstage](https://backstage.io/docs/features/kubernetes/overview)
3. Kubernetes plugin is properly configured and able to connect to the Hub cluster for OCM via a `ServiceAccount` (the cluster is accessed by backstage backend, therefore it requires a permanent connection with constant RBAC scope)
4. Following `ClusterRole` must be granted to `ServiceAccount` accessing the Hub cluster:
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
   ```

## Capabilities

- All clusters represented as `ManagedCluster`s in MultiClusterHub/MCE are discovered and imported into Backstage catalog:
  - Entity is defined as `kind: Resource` with `spec.type` set to `kubernetes-cluster`.
  - Links to OCP console, OCM console and OpenShift Cluster Manager are provided in `metadata.links`.
- Show real time data from OCM on Resource entity page including:
  - Cluster current status (up, down, etc.)
  - Cluster details (console link, OCP and Kubernetes version, etc.)
  - Details about available compute resources on the cluster

## Usage

This plugin is made up of 2 packages:

1. `@janus-idp/backstage-plugin-ocm-backend` connects backstage server to OCM.
2. `@janus-idp/backstage-plugin-ocm` contains frontend components, requires `*-backend` to be present and set up.

> If you are interested in Resource discovery only and you don't want to use any of our frontend components, you can install and configure only the `@janus-idp/backstage-plugin-ocm-backend` package.

### Setup `@janus-idp/backstage-plugin-ocm-backend`

1. Install the backend plugin:

   ```sh
   yarn workspace backend add @janus-idp/backstage-plugin-ocm-backend
   ```

2. Next, you need to configure it. Please add following to your `app-config.yaml` file:

   ```diff
   # app-config.yaml
   kubernetes:
     serviceLocatorMethod:
       type: "multiTenant"
     clusterLocatorMethods:
       - type: "config"
         clusters:
           - name: <cluster-name>
           ...
           ...

   + ocm:
   +   hub: <cluster-name> # Match the cluster name in kubernetes plugin config
   ```

   Please consult the documentation to [Backstage Kubernetes plugin](https://backstage.io/docs/features/kubernetes/configuration#configuring-kubernetes-clusters) for details on its configuration. Hub cluster must be connected via Service Account.

3. Create new plugin instance in `packages/backend/src/plugins/ocm.ts`:

   ```ts
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

4. Import and plug it into `packages/backend/src/index.ts`:

   ```diff
     ...
   + import ocm from './plugins/ocm';
     ...

     async function main() {
       ...
       const createEnv = makeCreateEnv(config);
       ...
   +   const ocmEnv = useHotMemoize(module, () => createEnv('ocm'));
       ...
       const apiRouter = Router();
       ...
   +   apiRouter.use('/ocm', await ocm(ocmEnv));
       ...
     }
   ```

5. Import the cluster `Resource` entity provider into `catalog` plugin in `packages/backend/src/plugins/catalog.ts`:

   ```diff
     ...
   + import { ManagedClusterProvider } from '@janus-idp/backstage-plugin-ocm-backend';
     ...
     export default async function createPlugin(
       env: PluginEnvironment,
     ): Promise<Router> {
       const builder = await CatalogBuilder.create(env);
       ...
   +   const ocm = ManagedClusterProvider.fromConfig(env.config, {
   +     logger: env.logger,
   +   });
   +   builder.addEntityProvider(ocm);
       ...
       const { processingEngine, router } = await builder.build();
       await processingEngine.start();
       ...
   +   await env.scheduler.scheduleTask({
   +     id: 'run_ocm_refresh',
   +     fn: async () => {
   +       await ocm.run();
   +     },
   +     frequency: { minutes: 30 },
   +     timeout: { minutes: 10 },
   +   });
       return router;
     }
   ```

### Setup `@janus-idp/backstage-plugin-ocm`

Install the frontend plugin:

```sh
yarn workspace app add @janus-idp/backstage-plugin-ocm
```

Then you can just pick whichever components you want to use.

#### OcmPage

A standalone page/dashboard showing all clusters as tiles.

Add to `packages/app/src/App.tsx`:

```diff
+ import { OcmPage } from '@janus-idp/backstage-plugin-ocm';

  const routes = (
    <FlatRoutes>
      ...
+     <Route path="/ocm" element={<OcmPage logo={<Logo />} />} />
      ...
    </FlatRoutes>
  );
```

And update navigation in `packages/app/src/components/Root/Root.tsx`:

```diff
+ import StorageIcon from '@material-ui/icons/Storage';
  ...
  export const Root = ({ children }: PropsWithChildren<{}>) => (
    <SidebarPage>
      <Sidebar>
        <SidebarGroup label="Menu" icon={<MenuIcon />}>
          ...
+         <SidebarItem icon={StorageIcon} to="ocm" text="Clusters" />
          ...
       </SidebarGroup>
       ...
      </Sidebar>
      {children}
    </SidebarPage>
  );
```

#### ClusterContextProvider

React context provided for OCM data related to current entity. This component is required to be used in order to display any data on following React components.

Place this context provider into your `Resource` entity rendeder (usually in `packages/app/src/components/catalog/EntityPage.tsx` or in a component imported by in here):

```diff
+ import { ClusterContextProvider } from '@janus-idp/backstage-plugin-ocm';
  ...
 const isType = (types: string | string[]) => (entity: Entity) => {
  if (!entity?.spec?.type) {
    return false;
  }
  return typeof types === 'string'
    ? entity?.spec?.type === types
    : types.includes(entity.spec.type as string);
};

+ const resourcePage = {
    ...
+           <EntitySwitch.Case if={e => e?.spec?.type === "kubernetes-cluster"}>
+             <ClusterContextProvider>
                ... // OCM plugin components goes here
+             </ClusterContextProvider>
+           </EntitySwitch.Case>
    ...
+ }
  ...
  export const entityPage = (
    <EntitySwitch>
      ...
+     <EntitySwitch.Case if={isKind('resource')} children={resourcePage} />
      ...
    </EntitySwitch>
  );


```

#### ClusterStatusCard

Entity component showing cluster availability status as an overview card.

```diff
  <ClusterContextProvider>
    ...
+   <ClusterStatusCard />
    ...
  </ClusterContextProvider>
```

#### ClusterInfoCard

Entity component showing details about cluster as a table.

```diff
  <ClusterContextProvider>
    ...
+   <ClusterInfoCard />
    ...
  </ClusterContextProvider>
```

#### ClusterAvailableResourceCard

Entity component showing all available resources on the cluster. References [`.status.capacity`](https://open-cluster-management.io/concepts/managedcluster/#cluster-heartbeats-and-status) of the `ManagedCluster` resource.

```diff
  <ClusterContextProvider>
    ...
+   <ClusterAvailableResourceCard />
    ...
  </ClusterContextProvider>
```

#### ClusterAllocatableResourceCard

Entity component showing allocatable resources on the cluster. References [`.status.allocatable`](https://open-cluster-management.io/concepts/managedcluster/#cluster-heartbeats-and-status) of the `ManagedCluster` resource.

```diff
  <ClusterContextProvider>
    ...
+   <ClusterAllocatableResourceCard />
    ...
  </ClusterContextProvider>
```

## Development

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/ocm](http://localhost:3000/ocm).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
