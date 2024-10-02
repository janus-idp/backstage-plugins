import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

/**
 * The lightspeed backend plugin.
 */
export const lightspeedPlugin = createBackendPlugin({
  pluginId: 'lightspeed',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,

        // TODO: for user authentication
        // httpAuth: coreServices.httpAuth,
        // userInfo: coreServices.userInfo,
      },
      async init({ logger, config, http }) {
        http.use(await createRouter({ config: config, logger }));

        // allow health endpoint to be unauthenticated accessible
        http.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });

        // temporarily. Will be remove after user authentication has been implemented
        http.addAuthPolicy({
          path: '/v1/query',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
