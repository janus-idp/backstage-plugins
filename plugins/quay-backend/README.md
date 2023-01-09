# plugin-quay-backend

Welcome to the plugin-quay-backend backend plugin!
This plugin will show information about your docker images within quay

_This plugin was created through the Backstage CLI_

## Getting started

### Enabling backend

```bash
cd packages/backend
yarn add @fmenesesg/backstage-plugin-quay-backend
```

Create a new file named `packages/backend/src/plugins/quay.ts`, and add the following to it

```ts
import { createRouter } from '@fmenesesg/backstage-plugin-quay-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment): Promise<Router> {
  return await createRouter({
    logger,
    config,
  });
}
```

And finally, wire this into the overall backend router. Edit `packages/backend/src/index.ts`

```ts
import quay from './plugins/quay';
// ...
async function main() {
  // ...
  const quayEnv = useHotMemoize(module, () => createEnv('quay'));
  // ...
  apiRouter.use('/quay', await quay(quayEnv));

```

## Configuration
The plugin requires configuration in the Backstage app-config.yaml to connect to quay API.

```yaml
quay:
  baseUrl: https://quay.io 
  # https://docs.quay.io/api/ 
  token: OAuth-2-Access-Token

```

Adding annotations and values to your component file.
```yaml
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: sample-system
  description: "A sample system"
  annotations:
    quay.io/repository-slug: organization/repository
```

