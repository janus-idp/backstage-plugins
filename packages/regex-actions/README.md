# Regex actions for Backstage

This plugin provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).

The following actions are currently supported in this plugin:

- [String replacement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)

## Prerequisites

- A [Backstage](https://backstage.io/docs/getting-started/) project

## Getting started

1. Install the action package in your Backstage project

   ```bash
   yarn workspace backend add @janus-idp/backstage-plugin-regex-actions
   ```

2. [Register](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) the regex actions by modifying the `packages/backend/src/plugins/scaffolder.ts` file from your project with the following changes:

   ```ts
   import { CatalogClient } from '@backstage/catalog-client';
   import {
     createBuiltinActions,
     createRouter,
   } from '@backstage/plugin-scaffolder-backend';
   import { ScmIntegrations } from '@backstage/integration';
   import { Router } from 'express';
   import type { PluginEnvironment } from '../types';
   import { createReplaceAction } from '@janus-idp/backstage-plugin-regex-actions';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
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

     const actions = [...builtInActions, createReplaceAction()];

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

## Usage

### Action : regex:replace

| Parameter Name             |  Type  | Required | Description                                                                     |
| -------------------------- | :----: | :------: | ------------------------------------------------------------------------------- |
| `regExps[].pattern`        | string |   Yes    | The regex pattern to match the value like in `String.prototype.replace()`       |
| `regExps[].flags`          | string |    No    | The flags for the regex, possible values are: `g`, `m`, `i`, `y`, `u`, `s`, `d` |
| `regExps[].replacement`    | string |   Yes    | The replacement value for the regex like in `String.prototype.replace()`        |
| `regExps[].values[].key`   | string |   Yes    | The key to access the regex value                                               |
| `regExps[].values[].value` | string |   Yes    | The input value of the regex                                                    |

> **Warning**
>
> The `regExps[].pattern` string cannot have a leading or trailing forward slash
>
> The `regExps[].values[].key` values must all be unique since the key is used for `values.<key>` to access the return value

#### Output

| Name           |  Type  | Description                                                                                        |
| -------------- | :----: | -------------------------------------------------------------------------------------------------- |
| `values.<key>` | string | A new string, with one, some, or all matches of the pattern replaced by the specified replacement. |
