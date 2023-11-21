import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { createRouter } from '../service/router';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: createBackendPlugin({
    pluginId: 'matomo',
    register(env) {
      env.registerInit({
        deps: {
          http: coreServices.httpRouter,
          logger: coreServices.logger,
          config: coreServices.rootConfig,
        },
        async init({ http, logger, config }) {
          const winstonLogger = loggerToWinstonLogger(logger);
          const router = await createRouter({
            logger: winstonLogger,
            config,
          });
          http.use(router);
        },
      });
    },
  }),
};
