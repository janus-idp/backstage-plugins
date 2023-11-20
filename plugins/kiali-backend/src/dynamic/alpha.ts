import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { kialiPlugin } from '../plugin';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',

  install: kialiPlugin,
};
