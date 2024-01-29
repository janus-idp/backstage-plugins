import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { scaffolderModuleSonarqubeActions } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: scaffolderModuleSonarqubeActions,
};
