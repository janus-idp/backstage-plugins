import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { PolicyBuilder } from '@janus-idp/backstage-plugin-rbac-backend';
import {
  PluginIdProvider,
  PluginIdProviderExtensionPoint,
  pluginIdProviderExtensionPoint,
  RBACProvider,
  rbacProviderExtensionPoint,
} from '@janus-idp/backstage-plugin-rbac-node';

/**
 * RBAC plugin
 *
 */
export const rbacPlugin = createBackendPlugin({
  pluginId: 'permission',
  register(env) {
    const pluginIdProviderExtensionPointImpl = new (class PluginIdProviderImpl
      implements PluginIdProviderExtensionPoint
    {
      pluginIdProviders: PluginIdProvider[] = [];

      addPluginIdProvider(pluginIdProvider: PluginIdProvider): void {
        this.pluginIdProviders.push(pluginIdProvider);
      }
    })();

    env.registerExtensionPoint(
      pluginIdProviderExtensionPoint,
      pluginIdProviderExtensionPointImpl,
    );

    const rbacProviders = new Array<RBACProvider>();

    env.registerExtensionPoint(rbacProviderExtensionPoint, {
      addRBACProvider(
        ...providers: Array<RBACProvider | Array<RBACProvider>>
      ): void {
        rbacProviders.push(...providers.flat());
      },
    });

    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        permissions: coreServices.permissions,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        lifecycle: coreServices.lifecycle,
      },
      async init({
        http,
        config,
        logger,
        discovery,
        permissions,
        auth,
        httpAuth,
        userInfo,
        lifecycle,
      }) {
        http.use(
          await PolicyBuilder.build(
            {
              config,
              logger,
              discovery,
              permissions,
              auth,
              httpAuth,
              userInfo,
              lifecycle,
            },
            {
              getPluginIds: () =>
                Array.from(
                  new Set(
                    pluginIdProviderExtensionPointImpl.pluginIdProviders.flatMap(
                      p => p.getPluginIds(),
                    ),
                  ),
                ),
            },
            rbacProviders,
          ),
        );
      },
    });
  },
});
