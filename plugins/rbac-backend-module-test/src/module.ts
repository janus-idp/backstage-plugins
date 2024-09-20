import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

import { rbacProviderExtensionPoint } from '@janus-idp/backstage-plugin-rbac-node';

import { TestProvider } from './provider/TestProvider';

/**
 * The test backend module for the rbac plugin.
 *
 * @alpha
 */
export const rbacModuleTest = createBackendModule({
  pluginId: 'permission',
  moduleId: 'test',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        rbac: rbacProviderExtensionPoint,
        scheduler: coreServices.scheduler,
        config: coreServices.rootConfig,
      },
      async init({ logger, rbac, scheduler, config }) {
        rbac.addRBACProvider(
          TestProvider.fromConfig(
            { config, logger },
            {
              scheduler: scheduler,
              schedule: scheduler.createScheduledTaskRunner({
                frequency: { minutes: 30 },
                timeout: { minutes: 3 },
              }),
            },
          ),
        );
      },
    });
  },
});
