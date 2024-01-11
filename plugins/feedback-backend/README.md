# Feedback Backend

This is feedback-backend plugin which provides Rest API to create feedbacks.

It is also repsonsible for creating JIRA tickets,

## Getting started

### Installation

1. Install the backend plugin.

   ```bash
   # From your backstage root directory
   yarn workspace backend add @janus-idp/backstage-plugin-feedback-backend
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
     const feedbackEnv = useHotMemoize(module, () => createEnv('feedback'));
     apiRouter.use('/feedback', await feedback(feedbackEnv));
   }
   ```

4. Now add below config in your `app-config.yaml` file.

   ```yaml
   feedback:
     integrations:
       jira:
         # Under this object you can define multiple jira hosts
         - host: ${JIRA_HOST_URL}
           token: ${JIRA_TOKEN}

       email:
         ## Email integration uses nodemailer to send emails
         host: ${EMAIL_HOST}
         port: ${EMAIL_PORT} # defaults to 587, if not found

         ## Email address of sender
         from: ${EMAIL_FROM}

         ## [optional] Authorization using user and password
         auth:
           user: ${EMAIL_USER}
           pass: ${EMAIL_PASS}

         # boolean
         secure: false

         # Path to ca certificate if required by mail server
         caCert: ${NODE_EXTRA_CA_CERTS}
   ```

### Set up frontend plugin

Follow instructions provided [feedback-plugin](../feedback/README.md)

### API reference

The API specifications file can be found at [docs/openapi3_0](./docs/openapi3_0.yaml)

### Run

1. Now run `yarn workspace @janus-idp/backstage-plugin-feedback-backedn start-backend`.
