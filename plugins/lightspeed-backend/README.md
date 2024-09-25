# Lightspeed Backend

This is the lightspeed backend plugin that enables you to interact with any LLM server running a model with OpenAI's API compatibility.

## Getting Started

### Installing the plugin

```bash
yarn add --cwd packages/backend  @janus-idp/backstage-plugin-lightspeed-backend
```

### Configuring the Backend

#### Old Backend System

1. Create a new file `packages/backend/src/plugins/lightspeed.ts`, and add the following

```ts title="packages/backend/src/plugins/lightspeed.ts"
import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-lightspeed-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    catalogApi: env.catalogApi,
  });
}
```

1. Next, in your overall backend router (typically `packages/backend/src/index.ts`) add a route for `/lightspeed`:

```ts title="packages/backend/src/index.ts"
import lightspeed from './plugins/lightspeed';

// ...
async function main() {
  // ...
  // Add the following line
  const lightspeedEnv = useHotMemoize(module, () => createEnv('lightspeed'));
  // ...
  // Add the following line under the other lines that add their routers to apiRouter
  apiRouter.use('/lightspeed', await lightspeed(lightspeedEnv));
  // ...
}
```

#### New Backend System

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(import('@janus-idp/backstage-plugin-lightspeed-backend'));

backend.start();
```

### Plugin Configurations

Add the following lightspeed configurations into your `app-config.yaml` file:

```yaml
lightspeed:
  servers:
    - id: <server id>
      url: <serverURL>
      token: <api key> # dummy token
```

Example local development configuration:

```yaml
lightspeed:
  servers:
    - id: 'my-llm-server'
      url: 'https://localhost:443/v1'
      token: 'js92n-ssj28dbdk902' # dummy token
```
