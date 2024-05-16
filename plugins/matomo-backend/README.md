# Matomo Backend

This is the matomo backend plugin that act as a proxy with matomo instance.

Plugin will inject the auth token and ensure that the request are only read only operations.

Matomo API cannot be used as proxy layer due to the token auth it follows. Thus this plugin will act as proxy layer

## Getting Started

### Installing the NPM package

```bash
yarn add --cwd packages/backend  @janus-idp/plugin-matomo-backend
```

### Installing the plugin

#### Adding the plugin to the legacy backend

1. Create a new file `packages/backend/src/plugins/matomo.ts`, and add the following

```ts title="packages/backend/src/plugins/matomo.ts"
import { Router } from 'express';

import { createRouter } from '@janus-idp/plugin-matomo-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({ config: env.config });
}
```

1. Next we wire this into overall backend router by editing the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
import matomo from './plugins/matomo';

/ ...
async function main() {
  / ...
  / Add this line under the other lines that follow the useHotMemoize pattern
  const matomoEnv = useHotMemoize(module, () => createEnv('matomo'));
  / ...
  / Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/matomo', await matomo(matomoEnv)); / ...
}
```

#### Adding the plugin to the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(import('@janus-idp/backstage-plugin-matomo-backend/alpha'));

backend.start();
```

### Plugin Configurations

Add the following configurations into your `app-config.yaml` file:

```yaml
matomo:
  apiToken: ${MATOMO_API_TOKEN}
  apiUrl: ${MATOMO_API_URL}
```
