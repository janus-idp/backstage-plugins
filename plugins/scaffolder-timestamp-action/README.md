# Timestamp custom action for Scaffolder Backstage

The timestamp module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

## For administrators

### Installation

#### Procedure

1. Install the Timestamp custom action plugin using the following command:

   ```console
   yarn workspace backend add @janus-idp/backstage-scaffolder-backend-module-timestamp
   ```

2. Integrate the custom action in the `scaffolder-backend` `createRouter` function:

- Install the `@backstage/integration` package using the following command:

  ```console
  yarn workspace backend add @backstage/integration
  ```

- Add the custom action with the other built-in actions:

  ```ts title="packages/backend/src/plugins/scaffolder.ts"

  import { CatalogClient } from '@backstage/catalog-client';
  /* highlight-add-start */
  import { ScmIntegrations } from '@backstage/integration';
  import {
  createBuiltinActions,
  createRouter,
  } from '@backstage/plugin-scaffolder-backend';
  import { createTimestampAction } from '@janus-idp/backstage-scaffolder-backend-module-timestamp';
  /* highlight-add-end */
  ...

  export default async function createPlugin(
  const catalogClient = new CatalogClient({
      discoveryApi: env.discovery,
  });

  /* highlight-add-start */
  const integrations = ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
      integrations: integrations as any,
      catalogClient,
      config: env.config,
      reader: env.reader,
  });
  const actions = [...builtInActions, createTimestampAction()];
  /* highlight-add-end */


  return await createRouter({
  /* highlight-add-next-line */
  actions,
  logger: env.logger,
  ...
  });
  ```

3. Add the **catalog:timestamping** custom action in your template yaml after the `Fetch Skeleton + Template` step to annotate the catalog-info.yaml skeleton with the current timestamp:

   ```tsx title="template.yaml"

   - id: template
     name: Fetch Skeleton + Template
     action: fetch:template
     ...

   /* highlight-add-start */
   - id: timestamp
     name: Add Timestamp to catalog-info.yaml
     action: catalog:timestamping
   /* highlight-add-end */

   ```
