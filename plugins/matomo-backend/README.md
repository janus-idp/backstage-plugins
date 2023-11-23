# Matomo Backend

This is the matomo backend plugin that act as a proxy with matomo instance.

Plugin will inject the auth token and ensure that the request are only read only operations.

Matomo API cannot be used as proxy layer due to the token auth it follows. Thus this plugin will act as proxy layer

## Getting started

1. First install the backend plugin

```bash
yarn add --cwd packages/backend  @janus-idp/plugin-matomo-backend
```

2. Then create a new file `packages/backend/src/plugins/matomo.ts`, and add the following

```ts
import { Router } from 'express';

import { createRouter } from '@janus-idp/plugin-matomo-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
  });
}
```

3. Next we wire this into overall backend router, edit `packages/backend/src/index.ts`:

```ts
import matomo from './plugins/matomo'
// ...

async function main() {
  // ...
  // Add this line under the other lines that follow the useHotMemoize pattern
  const matomoEnv = useHotMemoize(module, () => createEnv('matomo'));
  // ...
  // Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/matomo', await matomo(matomoEnv));
```

4. Now you need to add in app-config.yaml file

```yaml
matomo:
  apiToken: ${MATOMO_API_TOKEN}
  apiUrl: ${MATOMO_API_URL}
```

5. Now run `yarn start-backend` from repo
