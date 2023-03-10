# Parodos (orion)

Welcome to the parodos plugin!

former name: Orion

## Setup

1. Install the plugin into the Backstage app

```bash
yarn add --cwd packages/app @parodos/plugin-orion
```

2.  Add the `/parodos/` route in `/packages/app/src/App.tsx`

```ts
import { OrionPage } from '@parodos/plugin-orion';

const routes = (
  <FlatRoutes>
    // ...
    <Route path="/parodos" element={<OrionPage />} />
  </FlatRoutes>
```

3.  Add parodos endpoint to the proxy config in `app-config.yaml`.

```yaml
'/parodos':
  target: 'http://localhost:8080/api/v1'
  changeOrigin: true
  redirect: follow
  cache: 'no-cache'
  headers:
    Content-Type: 'application/json'
    accept: 'application/json'
    Authorization: ${PARODOS_AUTH_KEY}
```

For local development set the `PARODOS_AUTH_KEY` variable to the same value as in the `app-config.yaml`.