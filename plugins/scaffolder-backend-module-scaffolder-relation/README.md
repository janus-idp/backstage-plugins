# Scaffolder relation custom action for scaffolder

The scaffolder-relation module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

## Installation

To begin, install the module package into the backend workspace of your backstage instance:

```console
yarn workspace backend add @janus-idp/backstage-plugin-scaffolder-backend-module-scaffolder-relation
```

### Installation in the new backend system

To install this custom action into the new backend system, add the following in the `packages/backend/src/index.ts` file:

```ts title=packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import(
    '@janus-idp/backstage-plugin-scaffolder-backend-module-scaffolder-relation/alpha'
  ),
);
// highlight-add-end

backend.start();
```

### Installation in the legacy backend system

To install this custom action into the legacy backend system, add the following in the `packages/backend/src/plugins/scaffolder.ts` file:

```ts title=packages/backend/src/plugins/scaffolder.ts
// highlight-add-start
import { createScaffoldedFromSpecAction } from '@janus-idp/backstage-plugin-scaffolder-backend-module-scaffolder-relation';

// highlight-add-end

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // ...

  /* highlight-add-next-line */
  const actions = [...builtInActions, createScaffoldedFromSpecAction()];

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
  });
}
```

## Usage

### Action: catalog:scaffolded-from

Appends a `spec.scaffoldedFrom` field to the `catalog-info.yaml` file in the scaffolder task workspace. Refer to the [example templates](./examples/) for examples on how it's used.
