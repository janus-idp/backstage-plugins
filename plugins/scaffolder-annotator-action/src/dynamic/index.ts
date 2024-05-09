import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createScaffoldedFromAction, createTimestampAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createTimestampAction(), createScaffoldedFromAction()],
};
