import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createServiceNowActions } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: createServiceNowActions,
};
