import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { createQuayRepositoryAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createQuayRepositoryAction()],
};
