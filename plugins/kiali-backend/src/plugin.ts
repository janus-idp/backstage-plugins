import {
  HostDiscovery,
  loggerToWinstonLogger,
} from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './service/router';

/**
 * This is the backend plugin that provides the Kiali integration.
 * @alpha
 */
export const kialiPlugin = createBackendPlugin({
  pluginId: 'kiali',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalogApi: catalogServiceRef,
      },
      async init({ http, logger, config }) {
        const winstonLogger = loggerToWinstonLogger(logger);
        const catalogApi = new CatalogClient({
          discoveryApi: HostDiscovery.fromConfig(config),
        });
        const router = await createRouter({
          logger: winstonLogger,
          config,
          catalogApi,
        });
        http.use(router);
      },
    });
  },
});

export default kialiPlugin;
