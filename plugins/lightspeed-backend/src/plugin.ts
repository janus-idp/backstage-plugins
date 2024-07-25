import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

/**
 * The lightspeed backend plugin.
 *
 * @alpha
 */
export const lightspeedPlugin = createBackendPlugin({
  pluginId: 'lightspeed',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ config, logger, http }) {
        http.use(await createRouter({ ...config, logger }));
      },
    });
  },
});
