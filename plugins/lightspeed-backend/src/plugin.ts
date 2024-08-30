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
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
      },
      async init({ logger, config, http, httpAuth, userInfo }) {
        http.use(await createRouter({ config: config, logger, httpAuth, userInfo}));

        // allow health endpoint to be unauthenticated accessible
        http.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
