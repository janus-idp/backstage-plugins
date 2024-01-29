import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { scaffolderModuleServicenowActions } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: scaffolderModuleServicenowActions,
};
