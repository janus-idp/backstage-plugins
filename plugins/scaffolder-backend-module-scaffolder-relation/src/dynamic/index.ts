import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createScaffoldedFromSpecAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: () => [createScaffoldedFromSpecAction()],
};
