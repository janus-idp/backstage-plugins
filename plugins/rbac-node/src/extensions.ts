import { createExtensionPoint } from '@backstage/backend-plugin-api';

import { PluginIdProvider, RBACProvider } from './types';

/**
 * An extension point the exposes the ability to configure additional PluginIDProviders.
 *
 * @public
 */
export const pluginIdProviderExtensionPoint =
  createExtensionPoint<PluginIdProviderExtensionPoint>({
    id: 'permission.rbac.pluginIdProvider',
  });

/**
 * The interface for {@link pluginIdProviderExtensionPoint}.
 *
 * @public
 */
export type PluginIdProviderExtensionPoint = {
  addPluginIdProvider(pluginIdProvider: PluginIdProvider): void;
};

export const rbacProviderExtensionPoint =
  createExtensionPoint<RBACProviderExtensionPoint>({
    id: 'permission.rbac.rbacProvider',
  });

export type RBACProviderExtensionPoint = {
  addRBACProvider(
    ...providers: Array<RBACProvider | Array<RBACProvider>>
  ): void;
};
