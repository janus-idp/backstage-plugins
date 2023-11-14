import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { KeycloakOrgEntityProvider } from '../providers';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  async catalog(builder, env) {
    builder.addEntityProvider(
      KeycloakOrgEntityProvider.fromConfig(env.config, {
        id: 'development',
        logger: env.logger,
        scheduler: env.scheduler,
      }),
    );
  },
};
