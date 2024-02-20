import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createReplaceAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createReplaceAction()],
};
