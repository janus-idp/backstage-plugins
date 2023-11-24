import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { createServiceNowActions } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: createServiceNowActions,
};
