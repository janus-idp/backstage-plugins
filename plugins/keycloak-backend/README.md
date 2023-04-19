# Keycloak Backend Plugin for Backstage

This backend plugin integrates Keycloak into Backstage

## Capabilities

The following capabilities are included within this plugin:

- Synchronization of Keycloak Users in a Realm
- Synchronization of Keycloak Groups in a Realm and their Users

## Configuration

Communication between Backstage and Keycloak is facilitated through the Keycloak API. Support is available for using username/password or client credentials.

The following table describes the parameters that can configured under `catalog.providers.keycloakOrg.default` in the `app-config.yaml` file to enable the plugin:

| Name           | Description                                                                                                                             | Default Value | Required                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `baseUrl`      | Location of the Keycloak server, such as `https://localhost:8443/auth`. Note: newer versions of Keycloak omit the `/auth` context path. | ""            | Yes                                                  |
| `realm`        | Realm to synchronize                                                                                                                    | `master`      | No                                                   |
| `loginRealm`   | Realm used to authenticate against                                                                                                      | `master`      | No                                                   |
| `username`     | Username to authenticate as                                                                                                             | ""            | Yes if using password based authentication           |
| `password`     | Password to authenticate as                                                                                                             | ""            | Yes if using password based authentication           |
| `clientId`     | Client Id to authenticate with                                                                                                          | ""            | Yes if using client credentials based authentication |
| `clientSecret` | Client Secret to authenticate with                                                                                                      | ""            | Yes if using client credentials based authentication |

When using client credentials, the access type must be set to `confidential` and service accounts must be enabled. The following roles are required to be added from the `realm-management` client role:

- query-groups
- query-users
- view-users

The following table describes the parameters that can configured under `keycloak` in the `app-config.yaml` file to override the default parameters:

| Name             | Description                              | Default Value | Required |
| ---------------- | ---------------------------------------- | ------------- | -------- |
| `userQuerySize`  | The number of users to query at a time.  | `100`         | No       |
| `groupQuerySize` | The number of groups to query at a time. | `100`         | No       |

## Installation

1. The package must be installed into the backend of Backstage. When not integrating with a published package, the repository must be cloned locally and added to Backstage as shown below:

   ```shell
   # From your Backstage root directory
   yarn add --cwd packages/backend @janus-idp/backstage-plugin-keycloak-backend
   ```

2. Next add the basic configuration to `app-config.yaml`:

   ```yaml
   # app-config.yaml
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

3. Register the plugin in the `packages/backend/src/plugins/catalog.ts` file. The schedule can also be configured during this step. However there are possible ways of configuration:

   1. Configure the schedule inside the `app-config.yaml` file

      ```yaml
      # app-config.yaml
      catalog:
        providers:
          keycloakOrg:
            default:
              ...
              schedule: # optional; same options as in TaskScheduleDefinition
                # supports cron, ISO duration, "human duration" as used in code
                frequency: { minutes: 1 }
                # supports ISO duration, "human duration" as used in code
                timeout: { minutes: 1 }
                initialDelay: { seconds: 15 }
      ```

      and and then use the configured scheduler

      ```diff
      // packages/backend/src/plugins/catalog.ts
      + import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';

        export default async function createPlugin(
          env: PluginEnvironment,
        ): Promise<Router> {
          const builder = await CatalogBuilder.create(env);

      +   builder.addEntityProvider(
      +     KeycloakOrgEntityProvider.fromConfig(env.config, {
      +       id: 'development',
      +       logger: env.logger,
      +       scheduler: env.scheduler,
      +     }),
      +   )
        ...
        }
      ```

   2. Add a schedule directly inside the `packages/backend/src/plugins/catalog.ts` file:

      ```diff
      // packages/backend/src/plugins/catalog.ts
      + import { KeycloakOrgEntityProvider } from '@janus-idp/backstage-plugin-keycloak-backend';

        export default async function createPlugin(
          env: PluginEnvironment,
        ): Promise<Router> {
          const builder = await CatalogBuilder.create(env);

      +   builder.addEntityProvider(
      +     KeycloakOrgEntityProvider.fromConfig(env.config, {
      +       id: 'development',
      +       logger: env.logger,
      +       schedule: env.scheduler.createScheduledTaskRunner({
      +         frequency: { minutes: 1 },
      +         timeout: { minutes: 1 },
      +         initialDelay: { seconds: 15 }
      +       }),
      +     }),
      +   )
        ...
        }
      ```

## Limitations

If you have self-signed/corporate certificate issues, the temporary solution (and not recommended) is to set the following environment variable before starting Backstage:

`NODE_TLS_REJECT_UNAUTHORIZED=0`

### Viewing imported users and groups in backstage

After configuring the plugin as described in the previous sections the plugin
will import users and groups when started and on a regular basis. Once
the first import is complete you can list the users from the catalog page
by select `User`:
![catalog-list](./images/users.jpg)

You will then see the list of users:
![user-list](./images/user-list.jpg)

Selecting one of those users will show the information imported from Keycloak:
![user-profile](./images/user2.jpg)

Similarly you can select `Group`, view the list and then select/view the information imported from
Keycloak for a group:
![group-profile](./images/group1.jpg)
