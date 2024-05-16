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

import { createRouter } from './service/router';

/**
 * This is the backend plugin that provides the Notification integration.
 * @alpha
 */
export const notificationBackendPlugin = createBackendPlugin({
  pluginId: 'notifications',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        identity: coreServices.identity,
        tokenManager: coreServices.tokenManager,
      },
      async init({
        http,
        logger,
        config,
        database,
        discovery,
        permissions,
        identity,
        tokenManager,
      }) {
        const winstonLogger = loggerToWinstonLogger(logger);
        const router = await createRouter({
          logger: winstonLogger,
          config,
          database,
          discovery,
          permissions,
          identity,
          tokenManager,
        });
        http.use(router);
      },
    });
  },
});

export default notificationBackendPlugin;
