# Setting up the development environment for bulk import backend plugin

You can run a development setup using the following command:

```console
yarn workspace @janus-idp/backstage-plugin-bulk-import-backend run start
```

When you run the previous command, a standalone server for the bulk-import backend is setup utilizing the root app configurations.
The server is available at `http://localhost:7007/bulk-import`.

Please refer to the [API documentation](./docs/apis.md) for the API endpoints and their corresponding request and response formats.
