import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './service/router';

/**
 * This is the backend plugin that provides the Kubernetes integration.
 * @alpha
 */
export const kialiPlugin = createBackendPlugin({
  pluginId: 'kiali',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.config,
        catalogApi: catalogServiceRef,
      },
      async init({ http, logger, config, catalogApi }) {
        const winstonLogger = loggerToWinstonLogger(logger);
        // TODO: expose all of the customization & extension points of the builder here
        const router = await createRouter({
          logger: winstonLogger,
          config,
          catalog: catalogApi,
        });
        http.use(router);
      },
    });
  },
});

export default kialiPlugin;
