# Keycloak Backend Plugin for Backstage

This backend plugin integrates Keycloak into Backstage

## Capabilities

The following capabilities are included within this plugin:

- Synchronization of Keycloak Users in a Realm
- Synchronization of Keycloak Groups in a Realm and their Users

## Configuration

Communication between Backstage and Keycloak is facilitated through the Keycloak API. Support is available for using username/password or client credentials.

The following table describes the parameters that can configured in the `app-config.yaml` file to enable the plugin:

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

## Installation

The package must be installed into the backend of Backstage. When not integrating with a published package, the repository must be cloned locally and added to Backstage as shown below:

```shell
# From your Backstage root directory
yarn add --cwd packages/backend @janus-idp/keycloak-backend
```

Next add the basic configuration to `app-config.yaml`:

```yaml
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

Finally, register the plugin in the `packages/backend/src/plugins/catalog.ts` file.

```javascript
 // packages/backend/src/plugins/catalog.ts
+import { KeycloakOrgEntityProvider } from 'catalog-backend-module-keycloak';

 export default async function createPlugin(
   env: PluginEnvironment,
 ): Promise<Router> {
   const builder = await CatalogBuilder.create(env);

+  builder.addEntityProvider(
+    KeycloakOrgEntityProvider.fromConfig(env.config, {
+      id: 'development',
+      logger: env.logger,
+      schedule: env.scheduler.createScheduledTaskRunner({
+        frequency: { hours: 1 },
+        timeout: { minutes: 50 },
+        initialDelay: { seconds: 15 }
+      }),
+    }),
+  );
```
