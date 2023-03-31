# parodos-auth

> Login page.

This plugin is meant to be used in pair with:

- [@parodos/plugin-parodos](../parodos/README.md).

### Warning

This plugin is currently only for demonstration purposes until proper backend authentication is implemented.

## Installation

```bash
# From your Backstage root directory
yarn add --cwd packages/app @parodos/plugin-parodos-auth
```

## Configuration

In the `App.tsx` file, change the `createApp` function adding a `components` with our custom `ParodosSignInPage`

> `packages/app/src/App.tsx`

```tsx
import { ParodosSignInPage } from '@parodos/plugin-parodos-auth';

const app = createApp({
  // ...
  components: {
    SignInPage: ParodosSignInPage,
  },
  // ...
});
```

## apis.ts

The [parodos backend](https://github.com/parodos-dev/parodos) currently requires basic authentication.

To enable both basic auth and use the backstage proxy, the following configuration needs added to `./packages/app/src/apis.ts`

```ts
createApiFactory({
  api: fetchApiRef,
  deps: {
    configApi: configApiRef,
    identityApi: identityApiRef,
    discoveryApi: discoveryApiRef,
  },
  factory: ({ configApi, identityApi, discoveryApi }) => {
    return createFetchApi({
      middleware: [
        FetchMiddlewares.resolvePluginProtocol({
          discoveryApi,
        }),
        FetchMiddlewares.injectIdentityAuth({
          identityApi,
          config: configApi,
          header: {
            name: 'Authorization',
            value: token => `Basic ${token}`,
          },
        }),
      ],
    });
  },
}),
```

## local development

A login of `userName`: test and `password`: test will successfully log you in.
