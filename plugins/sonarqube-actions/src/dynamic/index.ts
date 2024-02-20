import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createSonarQubeProjectAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createSonarQubeProjectAction()],
};
