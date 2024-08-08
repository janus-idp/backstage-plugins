import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { PolicyBuilder } from '@janus-idp/backstage-plugin-rbac-backend';
import {
  PluginIdProvider,
  PluginIdProviderExtensionPoint,
  pluginIdProviderExtensionPoint,
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

    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        identity: coreServices.identity,
        permissions: coreServices.permissions,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
      },
      async init({
        http,
        config,
        logger,
        discovery,
        identity,
        permissions,
        auth,
        httpAuth,
        userInfo,
      }) {
        http.use(
          await PolicyBuilder.build(
            {
              config,
              logger,
              discovery,
              identity,
              permissions,
              auth,
              httpAuth,
              userInfo,
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
          ),
        );
      },
    });
  },
});
