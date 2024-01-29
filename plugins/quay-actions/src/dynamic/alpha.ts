import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { scaffolderModuleQuayAction } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: scaffolderModuleQuayAction,
};
