import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { createSonarQubeProjectAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createSonarQubeProjectAction()],
};
