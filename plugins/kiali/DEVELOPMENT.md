# Development environment

## Minimal Setup

1. Go to plugins/kiali

2. Execute yarn start

3. Go to `http://localhost:3000/kiali`

## Full Setup

1. Add libraries to packages/app and packages/backend:

   - Add to packages/app/package.json

   ```yaml title="packages/app/package.json"
   "@janus-idp/backstage-plugin-kiali": "link:../../plugins/kiali",
   ```

   or launch

   ```bash
   yarn workspace add @janus-idp/backstage-plugin-kiali@*
   ```

   - Add to packages/backend/package.json

   ```yaml title="packages/backend/package.json"
   '@janus-idp/backstage-plugin-kiali-backend': 'link:../../plugins/kiali-backend'
   ```

   or launch

   ```bash
   yarn workspace backend @janus-idp/backstage-plugin-kiali-backend@*
   ```

2. If you are going to modify `kiali-common` then you need to link this too.

   - Replace in plugin/kiali/package.json

   ```yaml title="plugin/kiali/package.json"
   "@janus-idp/backstage-plugin-kiali-common": "link:../kiali-common",
   ```

   or launch

   ```bash
   yarn upgrade @janus-idp/backstage-plugin-kiali-common@link:../kiali-common
   ```

   - Replace in plugin/kiali-backend/package.json

   ```yaml title="plugin/kiali-backend/package.json"
   "@janus-idp/backstage-plugin-kiali-common": "link:../kiali-common",
   ```

   or launch

   ```bash
   yarn upgrade @janus-idp/backstage-plugin-kiali-common@link:../kiali-common
   ```

3. Enable the **Kiali** tab on the entity view page using the `packages/app/src/components/catalog/EntityPage.tsx` file:

   ```tsx title="packages/app/src/components/catalog/EntityPage.tsx"
   /* highlight-add-next-line */
   import { EntityKialiContent } from '@janus-idp/backstage-plugin-kiali';

   const serviceEntityPage = (
     <EntityLayout>
       {/* ... */}
       {/* highlight-add-start */}
       <EntityLayout.Route path="/kiali" title="kiali">
         <EntityKialiContent />
       </EntityLayout.Route>
       {/* highlight-add-end */}
     </EntityLayout>
   );
   ```

4. Create a file called `kiali.ts` inside `packages/backend/src/plugins/` and add the following:

```ts
/* highlight-add-start */
import { CatalogClient } from '@backstage/catalog-client';

import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-kiali-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogApi = new CatalogClient({ discoveryApi: env.discovery });
  return await createRouter({
    logger: env.logger,
    catalogApi,
    config: env.config,
  });
}
/* highlight-add-end */
```

5. import the plugin to `packages/backend/src/index.ts`. There are three lines of code you'll need to add, and they should be added near similar code in your existing Backstage backend.

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

6. Configure you `app-config.yaml` with kiali configuration

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

## Configure auth

### Token authentication

1. Set the parameters in app-config.yaml

```yaml
catalog:
  providers:
    # highlight-add-start
    kiali:
      # Required. Kiali endpoint
      url: ${KIALI_ENDPOINT}
      # Required. Kiali authentication. Supported anonymous and token
      strategy: token
      # Optional. Required by token authentication
      serviceAccountToken: ${KIALI_SERVICE_ACCOUNT_TOKEN}
      # Optional. defaults false
      skipTLSVerify: true
      # Optional
```

2. To get `KIALI_SERVICE_ACCOUNT_TOKEN` create your service account and create the token

```bash
kubectl create token $KIALI_SERVICE_ACCOUNT
```
