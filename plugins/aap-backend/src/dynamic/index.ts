import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { AapResourceEntityProvider } from '../providers';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  async catalog(builder, env) {
    builder.addEntityProvider(
      AapResourceEntityProvider.fromConfig(env.config, {
        logger: env.logger,
        scheduler: env.scheduler,
      }),
    );
  },
};
