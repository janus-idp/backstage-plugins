import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

export const feedbackPlugin = createBackendPlugin({
  pluginId: 'feedback',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
      },
      async init({ logger, httpRouter, config, discovery }) {
        httpRouter.use(
          await createRouter({
            logger: loggerToWinstonLogger(logger),
            config: config,
            discovery: discovery,
          }),
        );
      },
    });
  },
});
