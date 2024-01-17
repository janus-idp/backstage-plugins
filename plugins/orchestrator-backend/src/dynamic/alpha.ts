import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import orchestratorModuleEntityProvider from '../module';
import { orchestratorPlugin } from '../OrchestratorPlugin';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: () => [orchestratorPlugin(), orchestratorModuleEntityProvider()],
};
