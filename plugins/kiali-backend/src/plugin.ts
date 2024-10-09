import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

export const kialiPlugin = createBackendPlugin({
  pluginId: 'kiali',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ http, logger, config }) {
        http.use(await createRouter({ logger, config }));
        http.addAuthPolicy({
          path: '/status',
          allow: 'unauthenticated',
        });
        http.addAuthPolicy({
          path: '/proxy',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

export default kialiPlugin;
