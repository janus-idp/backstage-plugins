# Catalog Backend Module for Scaffolder Relation Catalog Processor

This is an extension module to the catalog-backend plugin, providing an additional catalog entity processor that adds a new relation that depends on the `spec.scaffoldedBy` field to link scaffolder templates and the catalog entities they generated.

## Getting Started

1. Install the scaffolder relation catalog processor module using the following command:

   ```console
   yarn workspace backend add @janus-idp/backstage-plugin-catalog-backend-module-scaffolder-relation-processor
   ```

### Installing on the new backend system

To install this module into the [new backend system](https://backstage.io/docs/backend-system/), add the following into the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import(
    '@janus-idp/backstage-plugin-catalog-backend-module-scaffolder-relation-processor/alpha'
  ),
);
// highlight-add-end

backend.start();
```

### Installing on the legacy backend system

To install this module into the legacy backend system, add the following to the `packages/backend/src/plugins/catalog.ts` file:

```ts title=packages/backend/src/plugins/catalog.ts
// highlight-add-start
import { ScaffolderRelationEntityProcessor } from '@janus-idp/backstage-plugin-catalog-backend-module-scaffolder-relation-processor';

// highlight-add-end

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  /* ... other processors and/or providers ... */
  // highlight-add-start
  builder.addProcessor(new ScaffolderRelationEntityProcessor());
  // highlight-add-end

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  return router;
}
```
