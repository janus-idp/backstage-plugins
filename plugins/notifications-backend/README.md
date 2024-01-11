# Notifications

This Backstage backend plugin provides REST API endpoint for the notifications.

It's backed by a relational database, so far tested with PostgreSQL.

## Getting started

### Prerequisites

- Install [PostgresSQL DB](https://www.postgresql.org/download/)
- Configure Postgres for tcp/ip
  Open Postgres conf file for editing:

```bash
sudo vi /var/lib/pgsql/data/pg_hba.conf
```

Add this line:

```bash
host   all             postgres       127.0.0.1/32                          password
```

- Start Postgres server:

```bash
sudo systemctl enable --now postgresql.service
```

A new DB will be created: backstage_plugin_notifications

### Add NPM dependency

```
cd packages/backend
yarn add @backstage/plugin-notifications-backend
```

### Add backend-plugin

Create `packages/backend/src/plugins/notifications.ts` with following content:

```
import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from '@backstage/plugin-notifications-backend';

import { Router } from 'express';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
  const dbConfig = env.config.getConfig('backend.database');
  const notificationsServiceToServiceAuthEnabled =
    !!env.config.getOptionalBoolean('notifications.authorizeExternalCallers');

  return await createRouter({
    ...env,
    dbConfig,
    catalogClient,
    notificationsServiceToServiceAuthEnabled,
  });
}
```

### Add to router

In the `packages/backend/src/index.ts`:

```
import notifications from './plugins/notifications';
...
{/* Existing code for reference: */}
const apiRouter = Router();
...
{/* New code: */}
const notificationsEnv = useHotMemoize(module, () =>
  createEnv('notifications'),
);
apiRouter.use('/notifications', await notifications(notificationsEnv));
```

### Configure

In the `app-config.yaml` or `app-config.local.yaml`:

#### Database

```
  database:
    client: pg
    connection:
      host: 127.0.0.1
      port: 5432
      user: postgres
      password: secret
    knexConfig:
      pool:
        min: 3
        max: 12
        acquireTimeoutMillis: 60000
        idleTimeoutMillis: 60000
  cache:
    store: memory
```

#### Other configuration (optional):

```
notifications:
  authorizeExternalCallers: false
```

#### Authentication

Please refer https://backstage.io/docs/auth/ to set-up authentication.

The Notifications flows are based on the identity of the user.

All targetUsers, targetGroups or signed-in users receiving notifications must have corresponding entities created in the Catalog.
Refer https://backstage.io/docs/auth/identity-resolver for details.

For the purpose of development, there is `users.yaml` listing example data created.

#### Authorization

Every service endpoint is guarded by a permission check, enabled by default.

It is up to particular deployment to provide corresponding permission policies based on https://backstage.io/docs/permissions/writing-a-policy. To register your permission policies, refer https://backstage.io/docs/permissions/getting-started#integrating-the-permission-framework-with-your-backstage-instance.

#### Service-to-service and External Calls

The notification-backend is expected to be called by other backend plugins or external services.

To configure those two flows, refer

- https://backstage.io/docs/auth/service-to-service-auth.
- https://backstage.io/docs/auth/service-to-service-auth#usage-in-external-callers

**Note:** Recently we have difficulties to get authorization via custom JWT tokens of external services working. For this reason and to allow simple deployments, the service-to-service token authorization is skipped by default. Can be enabled via the backstage configuration (like `app-config.yaml`) by adding at the top-level:

```
notifications:
  authorizeExternalCallers: true
```

#### Catalog

The notifications require target users or groups (as receivers) to be listed in the Catalog.

As an example how to do it, add following to the config:

```
catalog:
  import:
    entityFilename: catalog-info.yaml
    pullRequestBranchName: backstage-integration
  rules:
    # *** Here is new change:
    - allow: [Component, System, API, Resource, Location, User, Group]
  locations:
    # Local example data, file locations are relative to the backend process, typically `packages/backend`
    - type: file
      # *** Here is new change, referes to a file stored in the root of the Backstage:
      target: ../../users.yaml
```

The example list of users is stored in the `plugins/notifications-backend/users.yaml` and can be copied to the root of the Backstage for development purposes.

## REST API

See `src/openapi.yaml` for full OpenAPI spec.

### Posting a notification

A notification without target users or groups is considered a system notification. That means it is intended for all users (listed among Updates in the UI).

Request (User message and then system message):

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json" -d '{"title": "My message title", "message": "I have nothing to say", "origin": "my-origin", "targetUsers": ["jdoe"], "targetGroups": ["jdoe"], "actions": [{"title": "my-title", "url": "http://foo.bar"}, {"title": "another action", "url": "https://foo.foo.bar"}]}'
```

```bash
curl -X POST http://localhost:7007/api/notifications/notifications -H "Content-Type: application/json" -d '{"title": "My message title", "message": "I have nothing to say", "origin": "my-origin", "actions": [{"title": "my-title", "url": "http://foo.bar"}, {"title": "another action", "url": "https://foo.foo.bar"}]}'
```

Optionally add `-H "Authorization: Bearer eyJh.....` with a valid JWT token if the service-to-service authorization is enabled (see above).

Response:

```json
{ "msgid": "2daac6ff-3aaa-420d-b755-d94e54248310" }
```

### Get notifications

Page number starts at '1'. Page number '0' along with page size '0' means no paging.
User parameter is mandatory because it is needed for message status and filtering (read/unread).

Query parameters:

- pageSize. 0 means no paging.
- pageNumber. first page is 1. 0 means no paging.
- orderBy.
- orderByDirec. asc/desc
- user. name of user to retrieve notification for
- containsText. filter title and message containing this text (case insensitive)
- createdAfter. fetch notifications created after this point in time
- messageScope. all/user/system. fetch notifications intended for specific user or system notifications or both
- read. true/false (read/unread)

Request:

```bash
curl 'http://localhost:7007/api/notifications/notifications?read=false&pageNumber=0&pageSize=0'
```

Response:

```json
[
  {
    "id": "2daac6ff-3aaa-420d-b755-d94e54248310",
    "created": "2023-10-30T13:48:34.931Z",
    "isSystem": false,
    "readByUser": false,
    "origin": "my-origin",
    "title": "My title",
    "message": "I have nothing to tell",
    "topic": "my-topic",
    "actions": []
  }
]
```

### Get count of notifications

User parameter is mandatory because it is needed for filtering (read/unread).

**Important: Logged-in user:**

The query requires a signed-in user whose entity is listed in the Catalog.
With this condition is met, the HTTP `Authorization` header contains a JWT token with the user's identity.

Optionally add `-H "Authorization: Bearer eyJh.....` with a valid JWT token to the `curl` commands bellow.

Query parameters:

- containsText. filter title and message containing this text (case insensitive)
- createdAfter. fetch notifications created after this point in time
- messageScope. all/user/system. fetch notifications intended for specific user or system notifications or both
- read. true/false (read/unread)

Request:

```bash
curl http://localhost:7007/api/notifications/notifications/count
```

Response:

```json
{ "count": "1" }
```

### Set notification as read/unread

Request:

```bash
curl -X PUT 'http://localhost:7007/api/notifications/notifications/read?messageID=48bbf896-4b7c-4b68-a446-246b6a801000&read=true'
```

Response: just HTTP status

## Building a client for the API

We supply an Open API spec YAML file: openapi.yaml.
