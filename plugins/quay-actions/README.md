# Quay actions for Backstage

This module provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [Quay](https://docs.quay.io/).

The following actions are currently supported in this module:

- Create a Quay repository

## Getting started

1. Install the action package in your Backstage project

   ```bash
   yarn workspace backend add @janus-idp/backstage-scaffolder-backend-module-quay
   ```

2. [Register](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) the Quay actions by modifying the `packages/backend/src/plugins/scaffolder.ts` file from your project with the following changes:

   ```ts
   import { CatalogClient } from '@backstage/catalog-client';
   import { ScmIntegrations } from '@backstage/integration';
   import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';

   import { Router } from 'express';

   import { createQuayRepositoryAction } from '@janus-idp/backstage-scaffolder-backend-module-quay';

   import type { PluginEnvironment } from '../types';

   export default async function createPlugin(env: PluginEnvironment): Promise<Router> {
     const catalogClient = new CatalogClient({
       discoveryApi: env.discovery,
     });

     const integrations = ScmIntegrations.fromConfig(env.config);

     const builtInActions = createBuiltinActions({
       integrations,
       catalogClient,
       config: env.config,
       reader: env.reader,
     });

     const actions = [...builtInActions, createQuayRepositoryAction()];

     return await createRouter({
       actions,
       logger: env.logger,
       config: env.config,
       database: env.database,
       reader: env.reader,
       catalogClient,
       identity: env.identity,
     });
   }
   ```

3. **Optional**: If you are doing the previous step for the first time, you also have to install the `@backstage/integration` package

   ```bash
   yarn workspace backend add @backstage/integration
   ```

4. Add the Quay actions to your templates, see the [example](./examples/templates/01-quay-template.yaml) file in this repository for complete usage examples

   ```yaml
   action: quay:create-repository
   id: create-quay-repo
   name: Create quay repo
   input:
     baseUrl: https://quay.io
     token: UW1dLVdCTj8uZWNuIW97K1k0XiBkSmppVU9MYzFT
     name: foo
     visibility: public
     description: This is a foo repository
     namespace: bar
     repoKind: image
   ```

## Usage

### Action: quay:create-repository

#### Input

| Parameter Name |  Type  | Required | Description                                                                       | Example                                  |
| -------------- | :----: | :------: | --------------------------------------------------------------------------------- | ---------------------------------------- |
| name           | string |   Yes    | Quay repository name                                                              | foo                                      |
| visibility     | string |   Yes    | Visibility setting for the created repository, either public or private           | public                                   |
| description    | string |   Yes    | Description for the created repository                                            | This if foo repository                   |
| token          | string |   Yes    | Authentication token, see [docs](https://docs.quay.io/api/)                       | UW1dLVdCTj8uZWNuIW97K1k0XiBkSmppVU9MYzFT |
| baseUrl        | string |    No    | Base url of a quay instance, defaults to <https://quay.io>                        | <https://foo.quay.io>                    |
| namespace      | string |    No    | Namespace to create repository in, defaults to the namespace the token belongs to | bar                                      |
| repoKind       | string |    No    | Created repository kind, either image or application, if empty defaults to image  | image                                    |

#### Output

| Name          |  Type  | Description                                |
| ------------- | :----: | ------------------------------------------ |
| repositoryUrl | string | Quay repository URL created by this action |

## Development

1. Add the local package dependency to the Backstage instance

   ```shell
   yarn workspace backend add file:./plugins/quay-actions
   ```

2. [Register](#getting-started) the Quay actions in your Backstage project
3. **Optional**: You can use the sample template from this repository and add it as `locations` in your `app-config.yaml` file

   ```yaml
   ---
   catalog:
     locations:
       - type: file
         target: ../../plugins/quay-actions/examples/templates/01-quay-template.yaml
         rules:
           - allow: [Template]
   ```

4. Run `yarn dev`
5. If you don't have a Quay account created yet you can create one for free on the [quay](https://quay.io) website
6. Start using the Quay actions in your templates
