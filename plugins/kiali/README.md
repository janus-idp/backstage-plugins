# Kiali plugin for Backstage

The Kiali Plugin
This plugin exposes information about your entity-specific ServiceMesh objects.

## Capabilities

The Kiali plugin has the following capabilities:

- Overview
  - Metrics by namespace
  - Health by namespace
  - Canary info
  - Istio Config warnings

## For administrators

### Setting up the Kiali plugin

#### Prerequisites

- The following annotation is added to the entity's `catalog-info.yaml` file to identify whether an entity contains the Kubernetes resources:

  ```yaml
  annotations:
    ...

    backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>
  ```

  You can also add the `backstage.io/kubernetes-namespace` annotation to identify the Kubernetes resources using the defined namespace.

  ```yaml
  annotations:
    ...

    backstage.io/kubernetes-namespace: <RESOURCE_NS>
  ```

- The following annotation is added to the `catalog-info.yaml` file of entity to view the latest `PipelineRun` in the CI/CD tab of the application:

  ```yaml
  annotations:
    ...

    janus-idp.io/kiali-enabled : 'true'
  ```

- A custom label selector can be added, which Backstage uses to find the Kubernetes resources. The label selector takes precedence over the ID annotations.

  ```yaml
  annotations:
    ...

    backstage.io/kubernetes-label-selector: 'app=my-app,component=front-end'
  ```

- The following label is added to the resources so that the Kubernetes plugin gets the Kubernetes resources from the requested entity:

  ```yaml
  labels:
    ...

    backstage.io/kubernetes-id: <BACKSTAGE_ENTITY_NAME>`
  ```

  ***

  **NOTE**

  When using the label selector, the mentioned labels must be present on the resource.

  ***

#### Procedure

1. Install the Kiali plugin using the following commands:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-kiali
   yarn workspace app add @janus-idp/backstage-plugin-kiali-backend
   ```

2. Enable the **Kiali** tab on the entity view page using the `packages/app/src/components/catalog/EntityPage.tsx` file:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-next-line */
   import { EntityKialiContent } from '@janus-idp/backstage-plugin-kiali';

   const serviceEntityPage = (
     <EntityPageLayout>
       {/* ... */}
       {/* highlight-add-start */}
       <EntityLayout.Route path="/kiali" title="kiali">
         <EntityKialiContent />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityPageLayout>
   );
   ```

3. Create a file called `kiali.ts` inside `packages/backend/src/plugins/` and add the following:

```ts
/* highlight-add-start */
import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-kiali-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
/* highlight-add-end */
```

4. import the plugin to `packages/backend/src/index.ts`. There are three lines of code you'll need to add, and they should be added near similar code in your existing Backstage backend.

```typescript title="packages/backend/src/index.ts"
// ..
/* highlight-add-next-line */
import kiali from './plugins/kiali';

async function main() {
  // ...
  /* highlight-add-next-line */
  const kialiEnv = useHotMemoize(module, () => createEnv('kiali'));
  // ...
  /* highlight-add-next-line */
  apiRouter.use('/kiali', await kiali(kialiEnv));
```

5. Configure you `app-config.yaml` with kiali configuration

```yaml
catalog:
  providers:
    # highlight-add-start
    kiali:
      # Required. Kiali endpoint
      url: ${KIALI_ENDPOINT}
      # Required. Kiali authentication. Supported anonymous and token
      strategy: ${KIALI_AUTH_STRATEGY}
      # Optional. Required by token authentication
      serviceAccountToken: ${KIALI_SERVICE_ACCOUNT_TOKEN}
      # Optional. defaults false
      skipTLSVerify: true
      # Optional
      caData: ${KIALI_CONFIG_CA_DATA}
      # Optional. Local path to CA file
      caFile: ''
      # Optional. Time in seconds that session is enabled, defaults to 1 minute.
      sessionTime: 60
      # highlight-add-end
```

Authentication methods:

- anonymous [Read docs about this authentication in kiali.io](https://kiali.io/docs/configuration/authentication/anonymous/)
- token [Read docs about this authentication in kiali.io](https://kiali.io/docs/configuration/authentication/token/)

The following table describes the parameters that you can configure to enable the plugin under `catalog.providers.keycloakOrg.<ENVIRONMENT_NAME>` object in the `app-config.yaml` file:

| Name                  | Description                                                                                                          | Default Value | Required                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------- |
| `url`                 | Location of the kIALI server, such as `https://localhost:4000`                                                       | ""            | Yes                                     |
| `strategy`            | Authentication strategy. [Methods](https://kiali.io/docs/configuration/authentication/)                              | `anonymous`   | Yes                                     |
| `serviceAccountToken` | Service Account Token which is used for querying data from Kiali                                                     | ""            | Yes if using token based authentication |
| `skipTLSVerify`       | Skip TLS certificate verification presented by the API server                                                        | false         | No                                      |
| `caData`              | Base64-encoded certificate authority bundle in PEM format                                                            | ""            | No                                      |
| `caFile`              | Filesystem path (on the host where the Backstage process is running) to a certificate authority bundle in PEM format | ""            | No                                      |
| `sessionTime`         | Time in seconds that session is enabled                                                                              | 60            | No                                      |

## For users

1. Open your Backstage application and select a component from the **Catalog** page.

![catalog-list](./images/catalog-list.png)

2. Check that you entity has the annotations.

![entity](./images/entity.png)

3. Go to the **Kiali** tab.

   The **Kiali** tab displays the Overview view associated to a Servicemesh.

   ![overview-tab](./images/overview_tab.png)

   There is also a **Go To Kiali Graph** option at the bottom of each card, which redirects you to the **Graph in the Kiali Standalone**.

## Development

To develop/contribute in kiali plugin follow [these instructions](./DEVELOPMENT.md)
