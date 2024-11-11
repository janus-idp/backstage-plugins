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
        catalogApi: catalogServiceRef,
        urlReader: coreServices.urlReader,
        permissions: coreServices.permissions,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        http: coreServices.httpRouter,
      },
      async init(props) {
        const { http } = props;
        const router = await createRouter(props);
        http.use(router);
        http.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        http.addAuthPolicy({
          path: '/static',
          allow: 'unauthenticated',
        });
        http.addAuthPolicy({
          path: '/docs',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
