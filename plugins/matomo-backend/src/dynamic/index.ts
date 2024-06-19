import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { matomoBackendPlugin } from '../plugin';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => matomoBackendPlugin(),
};
