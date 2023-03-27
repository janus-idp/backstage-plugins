# SonarQube actions for Backstage

This module provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [SonarQube](https://docs.sonarqube.org/latest/).

The following actions are currently supported in this module:

- Create a SonarQube [project](https://docs.sonarqube.org/latest/user-guide/project-page/)

## Prerequisites

- A [Backstage](https://backstage.io/docs/getting-started/) project
- A [SonarQube](https://docs.sonarqube.org/latest/) instance

## Getting started

1. Install the action package in your Backstage project
    ```bash
   yarn workspace backend add @janus-idp/sonarqube-actions
   ```
2. [Register](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) the SonarQube actions by modifying the `packages/backend/src/plugins/scaffolder.ts` file from your project with the following changes:
   ```ts
   import { CatalogClient } from '@backstage/catalog-client';
   import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';
   import {ScmIntegrations} from '@backstage/integration'
   import { Router } from 'express';
   import type { PluginEnvironment } from '../types';
   import { createSonarQubeProjectAction } from '@janus-idp/sonarqube-actions';
   
   export default async function createPlugin(
    env: PluginEnvironment,
   ): Promise<Router> {
    const catalogClient = new CatalogClient({
        discoveryApi: env.discovery,
    });
   
    const integrations = ScmIntegrations.fromConfig(env.config)
   
    const builtInActions = createBuiltinActions({
        integrations,
        catalogClient,
        config: env.config,
        reader: env.reader
    });
   
    const actions = [...builtInActions, createSonarQubeProjectAction()];
   
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
3. Add the SonarQube actions to your templates, see the [examples](./examples/templates) directory of this repository for complete usage examples
   ```yaml
      action: sonarqube:create-project
      id: 'create-sonar-project'
      name: 'Create SonarQube Project'
      input: 
        baseUrl: 'https://sonarqube.com'
        token: '4518a13e-093f-4b66-afac-46a1aece3149'
        name: 'My SonarQube Project'
        key: 'my-sonarqube-project'
        branch: 'main'
        visibility: 'public'
   ```
## Usage
### Action: sonarqube:create-project

#### Input:
| Parameter Name |  Type  | Required | Description                                                                                                              | Example               |
|----------------|:------:|:--------:|--------------------------------------------------------------------------------------------------------------------------|-----------------------|
| baseUrl        | string |   Yes    | SonarQube Instance base URL                                                                                              | http://sonar.acme.org |
| name           | string |   Yes    | Name of the project to be created in SonarQube                                                                           | My Project            |
| key            | string |   Yes    | Key of the project to be created in SonarQube                                                                            | my-project            |
| branch         | string |    No    | Key of the main branch of the project. If not provided, the default main branch key will be used.                        | main                  |
| visibility     | string |    No    | Whether the created project should be visible to everyone, or only specific user/groups.                                 | private or public     |
| token          | string |    No    | SonarQube authentication [token](https://docs.sonarqube.org/latest/user-guide/user-account/generating-and-using-tokens/) |                       |
| username       | string |    No    | SonarQube username                                                                                                       |                       |
| password       | string |    No    | SonarQube password                                                                                                       |                       |

   > **Warning**
   > Either the `token` or `username` and `password` input combination are required. 
   > If the three of them are provided, the `token` will take precedence



#### Output:
| Name       |  Type  | Description                                  |
|------------|:------:|----------------------------------------------|
| projectUrl | string | SonarQube project URL created by this action |             |

## Development
