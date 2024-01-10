# Feedback Backend

Welcome to the feedback backend plugin!

_This plugin was created through the Backstage CLI_

### Getting started

1. Install the backend plugin.

```bash
# From your backstage root directory
yarn add --cwd packages/backend @janus-idp/backstage-plugin-feedback-backend
```

2. Then create a new file `packages/backend/src/plugins/feedback.ts` and add the following:

```ts
import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-feedback-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    discovery: env.discovery,
  });
}
```

3. Next we wire this into overall backend router, edit `packages/backend/src/index.ts`:

```ts
import feedback from './plugins/feedback';

// ...

async function main() {
  // ...
  // Add this line under the other lines that follow the useHotMemoize pattern
  const feedbackEnv = useHotMemoize(module, () => createEnv('feedback'));
  // ...
  // Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/feedback', await feedback(feedbackEnv));
}
```

4. Now add below config in your `app-config.yaml` file.

```yaml
feedback:
  integrations:
    jira:
      - host: <jira-server-url>
        token: ${JIRA_TOKEN} # Can be obtained from your jira account
    mail:
      host: <your-smtp-host-address>
      port: <port-to-connect-to> # defaults to 587, if not found
      from:
        <email-address> # email address that to set in from field of mail
        # Supports nodemailer formats
      auth:
        user: ${EMAIL_USER}
        pass: ${EMAIL_PASS}
      secure: true # boolean
```

### Set up frontend plugin

Follow instructions provided [here](../feedback/README.md)

### Run

1. Now run `yarn start-backend`.
