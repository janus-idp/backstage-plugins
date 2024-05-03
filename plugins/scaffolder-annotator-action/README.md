# Annotator custom action for Scaffolder Backstage

The annotator module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

## Getting started

### Installing on the new backend system

To install the module into the [new backend system](https://backstage.io/docs/backend-system/), add the following into the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import('@janus-idp/backstage-scaffolder-backend-module-annotator/alpha'),
);
// highlight-add-end

backend.start();
```

### Installing on the legacy backend system

1. Install the Annotator custom action plugin using the following command:

   ```console
   yarn workspace backend add @janus-idp/backstage-scaffolder-backend-module-annotator
   ```

2. Integrate the custom actions in the `scaffolder-backend` `createRouter` function:

- Install the `@backstage/integration` package using the following command:

  ```console
  yarn workspace backend add @backstage/integration
  ```

- Add the `createTimestampAction` and `createScaffoldedFromAction` actions with the other built-in actions:

  ```ts title="packages/backend/src/plugins/scaffolder.ts"

  import { CatalogClient } from '@backstage/catalog-client';
  /* highlight-add-start */
  import { ScmIntegrations } from '@backstage/integration';
  import {
  createBuiltinActions,
  createRouter,
  } from '@backstage/plugin-scaffolder-backend';
  import { createTimestampAction, createScaffoldedFromAction } from '@janus-idp/backstage-scaffolder-backend-module-annotator';
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
  const actions = [...builtInActions, createTimestampAction(), createScaffoldedFromAction()];
  /* highlight-add-end */


  return await createRouter({
  /* highlight-add-next-line */
  actions,
  logger: env.logger,
  ...
  });
  ```

3. To annotate the catalog-info.yaml skeleton with the current timestamp, add the **catalog:timestamping** custom action in your template yaml after the `Fetch Skeleton + Template` step:

````tsx title="template.yaml"

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

4. To annotate the catalog-info.yaml skeleton with the template entityRef, add the **catalog:scaffolded-from** custom action in your template yaml after the `Fetch Skeleton + Template` step:

```tsx title="template.yaml"

- id: template
name: Fetch Skeleton + Template
action: fetch:template
...

/* highlight-add-start */
- id: append-templateRef
name: Append the entityRef of this template to the entityRef
action: catalog:scaffolded-from
/* highlight-add-end */

````
