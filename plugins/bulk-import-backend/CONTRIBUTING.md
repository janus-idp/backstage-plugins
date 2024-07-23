# Setting up the development environment for bulk import backend plugin

You can run a development setup using the following command:

```console
yarn workspace @janus-idp/backstage-plugin-bulk-import-backend run start
```

NOTE: For now, make sure to disable permissions by adding the following to your app-config:

```yaml
permission:
  enabled: true
```

When you run the previous command, a standalone server for the bulk-import backend is setup utilizing the root app configurations.
The server is available at `http://localhost:7007/api/bulk-import-backend`.

Please refer to the [API documentation](./api-docs/README.md) for the API endpoints and their corresponding request and response formats.

## Modifying the API

The source of truth for the API is the OpenAPI spec file: [`src/schema/openapi.yaml`](src/schema/openapi.yaml).

After any modification to this file, you need to regenerate the type definitions and API docs. You can do so by running the following command:

```console
yarn workspace @janus-idp/backstage-plugin-bulk-import-backend run openapi
```

If you add a new endpoint in the OpenAPI spec, you will need to:

1. regenerate the type definitions and API docs as depicted above
2. and implement its logic accordingly in the [`src/service/router.ts`](src/service/router.ts) file, like so:

```typescript
api.register(
  // myOperationId is the operation ID as named in the openapi.yaml spec
  'myOperationId',
  async (
    // You have access to the request body for this operation
    c: Context<Paths.MyOperationId.RequestBody>,
    req: express.Request,
    res: express.Response,
  ) => {
    // TODO Write your custom logic here: auth, permission check, custom handler.
    // You can access typed query parameters defined in the spec for this operation.
    // You can also access the typed request body with 'c.request.requestBody'.
    const q: Paths.MyOperationId.QueryParameters = Object.assign(
      {},
      c.request.query,
    );
    // someResponseBody = await myHandler(...)
    return res.status(200).json(someResponseBody);
  },
);
```
