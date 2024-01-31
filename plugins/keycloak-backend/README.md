# Keycloak backend plugin for Backstage

The Keycloak backend plugin integrates Keycloak into Backstage.

## Capabilities

The Keycloak backend plugin has the following capabilities:

- Synchronization of Keycloak users in a realm
- Synchronization of Keycloak groups and their users in a realm

## For administrators

### Installation

Install the Backstage package into the backend. When not integrating with a published package, clone the repository locally and add the Backstage as follows:

```console
yarn workspace backend add @janus-idp/backstage-plugin-keycloak-backend
```

### Configuration

#### Legacy Backend Configuration

1. Add the following configuration to the `app-config.yaml` file:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       keycloakOrg:
         default:
           baseUrl: https://<keycloak_host>/auth
           loginRealm: ${KEYCLOAK_REALM}
           realm: ${KEYCLOAK_REALM}
           clientId: ${KEYCLOAK_CLIENTID}
           clientSecret: ${KEYCLOAK_CLIENTSECRET}
   ```

1. Register the plugin in the `packages/backend/src/plugins/catalog.ts` file. You can also configure a schedule in this step. However, there are possible ways of configuration, such as:

   1. Configure a schedule inside the `app-config.yaml` file:

      ```yaml title="app-config.yaml"
      catalog:
        providers:
          keycloakOrg:
            default:
              # ...
              # highlight-add-start
              schedule: # optional; same options as in TaskScheduleDefinition
                # supports cron, ISO duration, "human duration" as used in code
                frequency: { minutes: 30 }
                # supports ISO duration, "human duration" as used in code
                timeout: { minutes: 3 }
                initialDelay: { seconds: 15 }
                # highlight-add-end
      ```

      Then use the configured scheduler by adding the following to the `packages/backend/src/plugins/catalog.ts`:

      ```ts title="packages/backend/src/plugins/catalog.ts"
      /* highlight-add-start */
      import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';

      /* highlight-add-end */

      export default async function createPlugin(
        env: PluginEnvironment,
      ): Promise<Router> {
        const builder = await CatalogBuilder.create(env);

        /* ... other processors and/or providers ... */
        /* highlight-add-start */
        builder.addEntityProvider(
          KeycloakOrgEntityProvider.fromConfig(env.config, {
            id: 'development',
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

      ***

      **NOTE**

      If you have made any changes to the schedule in the `app-config.yaml` file, then restart to apply the changes.

      ***

   1. Add a schedule directly inside the `packages/backend/src/plugins/catalog.ts` file as follows:

      ```ts title="packages/backend/src/plugins/catalog.ts"
      /* highlight-add-start */
      import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';

      /* highlight-add-end */

      export default async function createPlugin(
        env: PluginEnvironment,
      ): Promise<Router> {
        const builder = await CatalogBuilder.create(env);

        /* ... other processors and/or providers ... */
        builder.addEntityProvider(
          KeycloakOrgEntityProvider.fromConfig(env.config, {
            id: 'development',
            logger: env.logger,
            /* highlight-add-start */
            schedule: env.scheduler.createScheduledTaskRunner({
              frequency: { minutes: 30 },
              timeout: { minutes: 3 },
              initialDelay: { seconds: 15 },
            }),
            /* highlight-add-end */
          }),
        );

        const { processingEngine, router } = await builder.build();
        await processingEngine.start();
        return router;
      }
      ```

   ***

   **NOTE**

   If both the `schedule` (hard-coded schedule) and `scheduler` (`app-config.yaml` schedule) option are provided in the `packages/backend/src/plugins/catalog.ts`, the `scheduler` option takes precedence. However, if the schedule inside the `app-config.yaml` file is not configured, then the `schedule` option is used.

   ***

1. Optional: override the default Keycloak query parameters. Configure the parameters inside the `app-config.yaml` file:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       keycloakOrg:
         default:
           # ...
           # highlight-add-start
           userQuerySize: 500 # Optional
           groupQuerySize: 250 # Optional
           # highlight-add-end
   ```

1. Optional: provide a transformer function for user/group to mutate the entity before their ingestion into catalog. Extend `packages/backend/src/plugins/catalog.ts` with custom `userTransformer` and `groupTransformer` functions:

   ```ts title="packages/backend/src/plugins/catalog.ts"
   /* highlight-add-start */
   import {
     GroupTransformer,
     UserTransformer,
   } from '@janus-idp/backstage-plugin-keycloak-backend';

   /* highlight-add-end */

   /* highlight-add-start */
   // Suffix user entity name with realm name
   const userTransformer: UserTransformer = async (
     entity,
     user,
     realm,
     groups,
   ) => {
     entity.metadata.name = `${entity.metadata.name}_${realm}`;
     return entity;
   };
   /* highlight-add-end */

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     const builder = await CatalogBuilder.create(env);

     /* ... other processors and/or providers ... */
     builder.addEntityProvider(
       KeycloakOrgEntityProvider.fromConfig(env.config, {
         id: 'development',
         logger: env.logger,
         /* highlight-add-start */
         userTransformer,
         /* highlight-add-end */
       }),
     );

     const { processingEngine, router } = await builder.build();
     await processingEngine.start();
     return router;
   }
   ```

   `userTransformer` is an async function that is expected to resolve to `UserEntity` object or `undefined` (if you want to reject the entity) and accepts following parameters:

   - `entity`: The output of the default parser
   - `user`: Keycloak user representation
   - `realm`: Realm name
   - `groups`: Data about available groups

   `groupTransformer` is an async function that is expected to resolve to `GroupEntity` object or `undefined` (if you want to reject the entity) and accepts following parameters:

   - `entity`: The output of the default parser
   - `group`: Keycloak group representation
   - `realm`: Realm name

#### New Backend Configuration

1. Add the following configuration to the `app-config.yaml` file, and customize the schedule to fit your needs:

   ```yaml title="app-config.yaml"
   catalog:
     providers:
       keycloakOrg:
         default:
           baseUrl: https://<keycloak_host>/auth
           loginRealm: ${KEYCLOAK_REALM}
           realm: ${KEYCLOAK_REALM}
           clientId: ${KEYCLOAK_CLIENTID}
           clientSecret: ${KEYCLOAK_CLIENTSECRET}
           schedule: # Mandatory; same options as in TaskScheduleDefinition
             # supports cron, ISO duration, "human duration" as used in code
             frequency: { minutes: 30 } # Customize this to fit your needs
             # supports ISO duration, "human duration" as used in code
             timeout: { minutes: 3 } # Customize this to fit your needs
             initialDelay: { seconds: 15 } # Customize this to fit your needs
   ```

1. Register the plugin in the `packages/backend/src/index.ts` file:

   ```ts title="packages/backend/src/index.ts"
   const backend = createBackend();

   /* highlight-add-next-line */
   backend.add(import('@janus-idp/backstage-plugin-keycloak-backend/alpha'));

   backend.start();
   ```

---

**NOTE**

Currently the new backend installation method does not support transformer functions for users and groups.

---

Communication between Backstage and Keycloak is enabled by using the Keycloak API. Username/password or client credentials are supported authentication methods.

The following table describes the parameters that you can configure to enable the plugin under `catalog.providers.keycloakOrg.<ENVIRONMENT_NAME>` object in the `app-config.yaml` file:

| Name             | Description                                                                                                                                     | Default Value | Required                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `baseUrl`        | Location of the Keycloak server, such as `https://localhost:8443/auth`. Note that the newer versions of Keycloak omit the `/auth` context path. | ""            | Yes                                                  |
| `realm`          | Realm to synchronize                                                                                                                            | `master`      | No                                                   |
| `loginRealm`     | Realm used to authenticate                                                                                                                      | `master`      | No                                                   |
| `username`       | Username to authenticate                                                                                                                        | ""            | Yes if using password based authentication           |
| `password`       | Password to authenticate                                                                                                                        | ""            | Yes if using password based authentication           |
| `clientId`       | Client ID to authenticate                                                                                                                       | ""            | Yes if using client credentials based authentication |
| `clientSecret`   | Client Secret to authenticate                                                                                                                   | ""            | Yes if using client credentials based authentication |
| `userQuerySize`  | Number of users to query at a time                                                                                                              | `100`         | No                                                   |
| `groupQuerySize` | Number of groups to query at a time                                                                                                             | `100`         | No                                                   |

When using client credentials, the access type must be set to `confidential` and service accounts must be enabled. You must also add the following roles from the `realm-management` client role:

- `query-groups`
- `query-users`
- `view-users`

### Limitations

If you have self-signed or corporate certificate issues, you can set the following environment variable before starting Backstage:

`NODE_TLS_REJECT_UNAUTHORIZED=0`

---

**NOTE**
The solution of setting the environment variable is not recommended.

---

## For users

### Imported users and groups in Backstage using Keycloak plugin

After configuring the plugin successfully, the plugin imports the users and groups each time when started.

After the first import is complete, you can select **User** to list the users from the catalog page:

![catalog-list](./images/users.jpg)

You can see the list of users on the page:

![user-list](./images/user-list.jpg)

When you select a user, you can see the information imported from Keycloak:

![user-profile](./images/user2.jpg)

You can also select a group, view the list, and select or view the information imported from Keycloak for a group:

![group-profile](./images/group1.jpg)
