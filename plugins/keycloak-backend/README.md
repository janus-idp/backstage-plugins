# Keycloak Backend Plugin for Backstage

The Keycloak backend plugin integrates Keycloak into the Backstage.

## Capabilities

The Keycloak backend plugin has the following capabilities:

- Synchronization of Keycloak users in a realm
- Synchronization of Keycloak groups in a realm and their users

## Configuration

The communication between the Backstage and Keycloak is enabled using Keycloak API. The support is available for using username/password or client credentials.

The following table describes the parameters that you can configure in the `app-config.yaml` file to enable the plugin:

| Name           | Description                                                                                                                                     | Default Value | Required                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `baseUrl`      | Location of the Keycloak server, such as `https://localhost:8443/auth`. Note that the newer versions of Keycloak omit the `/auth` context path. | ""            | Yes                                                  |
| `realm`        | Realm to synchronize                                                                                                                            | `master`      | No                                                   |
| `loginRealm`   | Realm used to authenticate                                                                                                                      | `master`      | No                                                   |
| `username`     | Username to authenticate                                                                                                                        | ""            | Yes if using password based authentication           |
| `password`     | Password to authenticate                                                                                                                        | ""            | Yes if using password based authentication           |
| `clientId`     | Client Id to authenticate                                                                                                                       | ""            | Yes if using client credentials based authentication |
| `clientSecret` | Client Secret to authenticate                                                                                                                   | ""            | Yes if using client credentials based authentication |

When using client credentials, the access type must be set to `confidential` and service accounts must be enabled. You must add the following roles from the `realm-management` client role:

- `query-groups`
- `query-users`
- `view-users`

## Installation

1. Install the Backstage package into the backend. When not integrating with a published package, clone the repository locally and add the Backstage as follows:

   ```shell
   # From your Backstage root directory
   yarn add --cwd packages/backend @janus-idp/backstage-plugin-keycloak-backend
   ```

2. Add the following configuration to `app-config.yaml` file:

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

3. Register the plugin in the `packages/backend/src/plugins/catalog.ts` file. You can also configure a schedule in this step. However there are possible ways of configuration, such as:

   - Configure a schedule inside the `app-config.yaml` file:

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

     Use the configured scheduler as follows:

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

   - Add a schedule directly inside the `packages/backend/src/plugins/catalog.ts` file as follows:

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

If you have self-signed/corporate certificate issues, the temporary solution is to set the following environment variable before starting Backstage:

`NODE_TLS_REJECT_UNAUTHORIZED=0`

---

**NOTE**

The temporary solution of setting environment variable is not recommended.

---

### View imported users and groups in Backstage

After configuring the plugin as described in the previous sections the plugin imports the users and groups on a regular basis when started. Once the first import is complete, select `User` to list the users from the catalog page:
![](./images/users.jpg)

You can see the list of users on the page:
![](./images/user-list.jpg)

When you select a user, you can see the information imported from the Keycloak:
![](./images/user2.jpg)

Similarly, you can select a `Group`, view the list, and select or view the information imported from the
Keycloak for a group:
![](./images/group1.jpg)
