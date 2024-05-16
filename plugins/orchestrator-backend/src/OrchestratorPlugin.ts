import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './routerWrapper';

export const orchestratorPlugin = createBackendPlugin({
  pluginId: 'orchestrator',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        urlReader: coreServices.urlReader,
        scheduler: coreServices.scheduler,
        catalogApi: catalogServiceRef,
      },
      async init({
        logger,
        config,
        discovery,
        httpRouter,
        catalogApi,
        urlReader,
        scheduler,
      }) {
        const log = loggerToWinstonLogger(logger);
        const router = await createRouter({
          config: config,
          logger: log,
          discovery: discovery,
          catalogApi: catalogApi,
          urlReader: urlReader,
          scheduler: scheduler,
        });
        httpRouter.use(router);
      },
    });
  },
});
