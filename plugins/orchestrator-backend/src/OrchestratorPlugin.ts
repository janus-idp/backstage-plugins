import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { DefaultEventBroker } from '@backstage/plugin-events-backend';

import { createRouter } from './service/router';

export const orchestratorPlugin = createBackendPlugin({
  pluginId: 'swf',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        urlReader: coreServices.urlReader,
        catalogApi: catalogServiceRef,
      },
      async init({
        logger,
        config,
        discovery,
        httpRouter,
        catalogApi,
        urlReader,
      }) {
        const log = loggerToWinstonLogger(logger);
        const router = await createRouter({
          eventBroker: new DefaultEventBroker(log),
          config: config,
          logger: log,
          discovery: discovery,
          catalogApi: catalogApi,
          urlReader: urlReader,
        });
        httpRouter.use(router);
      },
    });
  },
});
