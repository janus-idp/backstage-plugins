import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import catalogModuleKeycloakEntityProvider from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: catalogModuleKeycloakEntityProvider,
};
