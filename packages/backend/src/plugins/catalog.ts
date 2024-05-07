import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';

import { Router } from 'express';

import { ManagedClusterProvider } from '@janus-idp/backstage-plugin-ocm-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const ocm = ManagedClusterProvider.fromConfig(env.config, {
    logger: env.logger,
    scheduler: env.scheduler,
    // env.scheduler.createScheduledTaskRunner({
    //   frequency: { minutes: 1 },
    //   timeout: { minutes: 1 },
    // }),
  });
  builder.addEntityProvider(ocm);
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
