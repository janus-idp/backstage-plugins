import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { ThreeScaleApiEntityProvider } from '../providers';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  async catalog(builder, env) {
    builder.addEntityProvider(
      ThreeScaleApiEntityProvider.fromConfig(env.config, {
        logger: env.logger,
        scheduler: env.scheduler,
      }),
    );
  },
};
