# AAP Backstage provider

The AAP Backstage provider plugin synchronizes the AAP content into the [Backstage](https://backstage.io/) catalog.

## For administrators

### Installation

Run the following command to install the AAP Backstage provider plugin:

```console
yarn workspace backend add @janus-idp/backstage-plugin-aap-backend
```

### Configuration

AAP Backstage provider allows configuration of one or multiple providers using the `app-config.yaml` configuration file of Backstage.

**Procedure**

1. Use a `aap` marker to start configuring the `app-config.yaml` file of Backstage:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       aap:
         dev:
           baseUrl: <URL>
           authorization: 'Bearer ${AAP_AUTH_TOKEN}'
           owner: <owner>
           system: <system>
           schedule: # optional; same options as in TaskScheduleDefinition
             # supports cron, ISO duration, "human duration" as used in code
             frequency: { minutes: 1 }
             # supports ISO duration, "human duration" as used in code
             timeout: { minutes: 1 }
   ```

2. Add the following code to `packages/backend/src/plugins/catalog.ts` file if has configured the scheduler inside the `app-config.yaml`:

   ```ts title="packages/backend/src/plugins/catalog.ts"
   /* highlight-add-next-line */
   import { AapResourceEntityProvider } from '@janus-idp/backstage-plugin-aap-backend';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     const builder = await CatalogBuilder.create(env);

     /* ... other processors and/or providers ... */
     /* highlight-add-start */
     builder.addEntityProvider(
       AapResourceEntityProvider.fromConfig(env.config, {
         logger: env.logger,
         scheduler: env.scheduler,
       }),
     );
     /* highlight-add-end */

     const { processingEngine, router } = await builder.build();
     await processingEngine.start();
     return router;
   }
   ```

if have not configured then add a schedule directly inside the `packages/backend/src/plugins/catalog.ts` file:

```ts title="packages/backend/src/plugins/catalog.ts"
/* highlight-add-next-line */
import { AapResourceEntityProvider } from '@janus-idp/backstage-plugin-aap-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  /* ... other processors and/or providers ... */
  /* highlight-add-start */
  builder.addEntityProvider(
    AapResourceEntityProvider.fromConfig(env.config, {
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 1 },
        timeout: { minutes: 1 },
      }),
    }),
  );
  /* highlight-add-end */

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
```

### Troubleshooting

When you start your Backstage application, you can see some log lines as follows:

```log
[1] 2023-02-13T15:26:09.356Z catalog info Discovered ResourceEntity API type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.423Z catalog info Discovered ResourceEntity Red Hat Event (DEV, v1.2.0) type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.620Z catalog info Discovered ResourceEntity Red Hat Event (TEST, v1.1.0) type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Discovered ResourceEntity Red Hat Event (PROD, v1.1.0) type=plugin target=AapResourceEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Applying the mutation with 3 entities type=plugin target=AapResourceEntityProvider:dev
```
