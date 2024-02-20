import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createQuayRepositoryAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createQuayRepositoryAction()],
};
