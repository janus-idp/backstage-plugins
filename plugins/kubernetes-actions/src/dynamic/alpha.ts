import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { scaffolderModuleKubernetesAction } from '../module';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: scaffolderModuleKubernetesAction,
};
