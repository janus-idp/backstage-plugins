import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { createReplaceAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createReplaceAction()],
};
