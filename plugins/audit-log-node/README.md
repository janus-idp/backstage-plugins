# @janus-idp/backstage-plugin-audit-log-node

This package contains common types and utility functions for audit logging the backend

## Installation

To install this plugin in a package/plugin, run the following command:

```console
yarn workspace <package/plugin> add @janus-idp/backstage-plugin-audit-log-node
```

### Usage

The audit logging node package contains a helper class for generating audit logs with a common structure, as well as logging them.

The `auditLog` function can be used to log out an audit log using the backstage `LoggerService`. You can provide a log level to the `auditLog` function. The supported levels are: `info`, `debug`, `warn`, and `error`. If no log level is provided, it defaults to the `info` level.

Alternatively, if you want to generate the audit log object (does not contain message) without it being logged out for you, the `createAuditLogDetails` helper function of the `DefaultAuditLogger` can be used.

The `DefaultAuditLogger.createAuditLogDetails` will generate the `actorId` of the actor with the following priority (highest to lowest):

- The `actorId` provided in the arguments
- The actor id generated from the `express.Request` object provided in the arguments
- `null` if neither of the above fields were provided in the arguments

#### Event Naming Convention

It is recommended that you prefix the `eventName` value with the name of the component you are audit logging. This will help with searchability in the central log collector.

For example, "ScaffolderTaskRead", "CatalogEntityFetch", etc.

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

#### Audit Log Example

In the following example, we add a simple audit log for the `/health` endpoint of a plugin's router to the `debug` log level.

```ts plugins/test/src/service/router.ts
import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

/* highlight-add-start */
import { DefaultAuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';

/* highlight-add-end */

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  auth: AuthService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, auth, httpAuth } = options;

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
    // Note: if `level` is not provided, it defaults to `info`
    auditLogger.auditLog({
      eventName: 'HealthEndpointHit',
      stage: 'completion',
      status: 'succeeded',
      level: 'debug',
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

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
```

Assuming the `user:default/tester` user hit requested this endpoint, something similar to the following would be outputted if the logger format is JSON:

```JSON
{"actor":{"actorId":"user:default/tester","hostname":"localhost","ip":"::1","userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"},"eventName":"HealthEndpointHit","isAuditLog":true,"level":"debug","message":"The Health Endpoint was hit by user:default/tester","meta":{},"plugin":"test","request":{"body": "","method":"GET","params":{},"query":{},"url":"/api/test/health"},"service":"backstage","stage":"completion","status":"succeeded","timestamp":"2024-05-17 11:17:07","type":"plugin"}
```

#### Audit Log Error Example

In the following example, we utilize the `auditLog` utility function to generate and output an error log to the `error` log level:

```ts plugins/test/src/service/router.ts
import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';

/* highlight-add-start */
import { DefaultAuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';

/* highlight-add-end */

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

  router.get('/error', async (request, response) => {
    try {
      const customErr = new Error('Custom Error Occurred');
      customErr.name = 'CustomError';

      throw customErr;

      response.json({
        status: 'ok',
      });
    } catch (err) {
      /* highlight-add-start */
      auditLogger.auditLog({
        eventName: 'ErrorEndpointHit',
        stage: 'completion',
        status: 'failed',
        level: 'error',
        request,
        response: {
          status: 501,
          body: {
            errors: [
              {
                name: (err as Error).name,
                message: (err as Error).message,
              },
            ],
          },
        },
        errors: [customErr],
        message: `An error occurred when querying the '/errors' endpoint`,
      });
      /* highlight-add-end */
      // Do something with the caught error
      response.status(501).json({
        errors: [
          {
            name: (err as Error).name,
            message: (err as Error).message,
          },
        ],
      });
    }
  });
  router.use(errorHandler());
  return router;
}
```

An example error audit log would be in the following form:
Note: the stack trace was removed redacted in this example due to its size.

```JSON
{"actor":{"actorId":"user:development/guest","hostname":"localhost","ip":"::1","userAgent":"curl/8.2.1"},"errors":[{"message":"Custom Error Occurred","name":"CustomError","stack":"CustomError: Custom Error Occurred\n    at STACK_TRACE]"}],"eventName":"ErrorEndpointHit","isAuditLog":true,"level":"error","message":"An error occurred when querying the '/errors' endpoint","meta":{},"plugin":"test","request":{"body":{},"method":"GET","params":{},"query":{},"url":"/api/test/error"},"response":{"body":{"errors":[{"name":"CustomError","message":"Custom Error Occurred"}]},"status":501},"service":"backstage","stage":"completion","status":"failed","timestamp":"2024-05-23 10:09:04"}
```
