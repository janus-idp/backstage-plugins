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

import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './service/router';

/**
 * The bulk-import backend plugin.
 */
export const bulkImportPlugin = createBackendPlugin({
  pluginId: 'bulk-import',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
        cache: coreServices.cache,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        httpAuth: coreServices.httpAuth,
        auth: coreServices.auth,
        catalogApi: catalogServiceRef,
      },
      async init({
        config,
        logger,
        http,
        cache,
        discovery,
        permissions,
        httpAuth,
        auth,
        catalogApi,
      }) {
        const router = await createRouter({
          config,
          cache,
          discovery,
          permissions,
          logger,
          httpAuth,
          auth,
          catalogApi,
        });
        http.use(router);
        http.addAuthPolicy({
          path: '/ping',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
