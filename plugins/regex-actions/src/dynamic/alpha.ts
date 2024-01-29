import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { scaffolderModuleRegexActions } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: scaffolderModuleRegexActions,
};
