/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './service/router';

/**
 * The bulk-import backend plugin.
 *
 * @alpha
 */
export const bulkImportPlugin = createBackendPlugin({
  pluginId: 'bulk-import-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        identity: coreServices.identity,
        catalogApi: catalogServiceRef,
      },
      async init({
        config,
        logger,
        http,
        discovery,
        permissions,
        identity,
        catalogApi,
      }) {
        http.use(
          await createRouter({
            config,
            discovery,
            permissions,
            identity,
            logger: loggerToWinstonLogger(logger),
            catalogApi,
          }),
        );
      },
    });
  },
});
