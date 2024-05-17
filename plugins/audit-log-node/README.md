# @janus-idp/backstage-plugin-audit-log-node

This package contains common types and utility functions for audit logging the backend

## Installation

To install this plugin in a package/plugin, run the following command:

```console
yarn workspace <package/plugin> add @janus-idp/backstage-plugin-audit-log-node
```

### Usage

The audit logging node package contains a helper class for generating audit logs with a common structure, as well as logging them.

The `auditLog` and `auditErrorLog` functions can be used to log out an audit log using the backstage `LoggerService`.

Alternatively, if you want to generate the audit log object (does not contain message) without it being logged out for you, the `createAuditLogDetails` helper function of the `DefaultAuditLogger` can be used.

The `DefaultAuditLogger.createAuditLogDetails` will generate the `actorId` of the actor with the following priority (highest to lowest):

- The `actor_id` provided in the arguments
- The actor id generated from the `express.Request` object provided in the arguments
- `null` if neither of the above fields were provided in the arguments

---

**IMPORTANT**

Any fields containing secrets provided to these helper functions should have secrets redacted or else they will be logged as is.

For the `DefaultAuditLogger`, these fields would include:

- The `metadata` field
- The following fields in the `request`:
  - `request.body`
  - `request.params`
  - `request.query`
- The `response.body` field

---

The `getActorId` helper function grabs the specified entityRef of the user or service associated with the provided credentials in the provided express Request object. If no request is provided or no user/service was associated to the request, `undefined` is returned.

### Example

In the following example, we add a simple audit log for the `/health` endpoint of a plugin's router.

```ts plugins/test/src/service/router.ts
/* highlight-add-start */

/* highlight-add-end */

import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';

import { DefaultAuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';

export interface RouterOptions {
  logger: LoggerService;
  auth: AuthService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, auth, httpAuth } = options;

  /* highlight-add-start */
  const auditLogger = new DefaultAuditLogger({
    logger,
    auth,
    httpAuth,
  });
  /* highlight-add-end */

  const router = Router();
  router.use(express.json());

  router.get('/health', async (request, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });

    /* highlight-add-start */
    auditLogger.auditLog({
      eventName: 'HealthEndpointHit',
      stage: 'completion',
      request,
      response: {
        status: 200,
        body: { status: 'ok' },
      },
      message: `The Health Endpoint was hit by ${await auditLogger.getActorId(
        request,
      )}`,
    });
    /* highlight-add-end */
  });
  router.use(errorHandler());
  return router;
}
```

Assuming the `user:default/tester` user hit requested this endpoint, something similar to the following would be outputted if the logger format is JSON:

```JSON
{"actor":{"actorId":"user:default/tester","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},"eventName":"HealthEndpointHit","isAuditLog":true,"level":"info","message":"The Health Endpoint was hit by user:default/tester","meta":{},"plugin":"test","request":{"body": "","method":"GET","params":{},"query":{},"url":"/api/test/health"},"service":"backstage","stage":"completion","status":"succeeded","timestamp":"2024-05-17 11:17:07","type":"plugin"}
```
