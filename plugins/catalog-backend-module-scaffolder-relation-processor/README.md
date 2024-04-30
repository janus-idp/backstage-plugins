# Catalog Backend Module for Scaffolder Relation Catalog Processor

This is an extension module to the catalog-backend plugin, providing an additional catalog entity processor that adds a new relation that depends on the `spec.scaffoldedBy` field to link scaffolder templates and the catalog entities they generated.

## Getting Started

1. Install the scaffolder relation catalog processor module using the following command:

   ```console
   yarn workspace backend add @janus-idp/backstage-plugin-catalog-backend-module-scaffolder-relation-processor
   ```

2. To install this plugin into the [new backend system](https://backstage.io/docs/backend-system/), add the following into the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import(
    '@janus-idp/backstage-plugin-catalog-backend-module-scaffolder-relation-processor'
  ),
);
// highlight-add-end

backend.start();
```
