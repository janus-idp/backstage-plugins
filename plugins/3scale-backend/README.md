# 3scale Backstage provider

This is a plugin for synchronizing 3scale content into [Backstage.io](https://backstage.io/) catalog.

## Install

1. Install the plugin

   ```console
   yarn workspace backend add @janus-idp/backstage-plugin-3scale-backend
   ```

## Configure

3scale Backstage provider allows configuration of one or many providers using the `app-config.yaml` configuration file of Backstage. Use a `threeScaleApiEntity` marker to start configuring them.

```yaml title="app-config.yaml"
catalog:
  providers:
    threeScaleApiEntity:
      dev:
        baseUrl: https://<TENANT>-admin.3scale.net
        accessToken: <ACCESS_TOKEN>
        schedule: # optional; same options as in TaskScheduleDefinition
          # supports cron, ISO duration, "human duration" as used in code
          frequency: { minutes: 1 }
          # supports ISO duration, "human duration" as used in code
          timeout: { minutes: 1 }
```

Once you've done that, you'll also need to add the segment below to `packages/backend/src/plugins/catalog.ts`:

```ts title="packages/backend/src/plugins/catalog.ts"
/* highlight-add-next-line */
import { ThreeScaleApiEntityProvider } from '@janus-idp/backstage-plugin-3scale-backend';

export default async function createPlugin(env: PluginEnvironment): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  /* ... other processors and/or providers ... */
  /* highlight-add-start */
  builder.addEntityProvider(
    ThreeScaleApiEntityProvider.fromConfig(env.config, {
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

## Troubleshoot

After having started your Backstage app, you should see some lines like those below in logs:

```log
[1] 2023-02-13T15:26:09.356Z catalog info Discovered ApiEntity API type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.423Z catalog info Discovered ApiEntity Red Hat Event (DEV, v1.2.0) type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.620Z catalog info Discovered ApiEntity Red Hat Event (TEST, v1.1.0) type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Discovered ApiEntity Red Hat Event (PROD, v1.1.0) type=plugin target=ThreeScaleApiEntityProvider:dev
[1] 2023-02-13T15:26:09.819Z catalog info Applying the mutation with 3 entities type=plugin target=ThreeScaleApiEntityProvider:dev
```
