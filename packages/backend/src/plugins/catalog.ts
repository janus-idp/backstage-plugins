import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';

import { Router } from 'express';

import { OrchestratorEntityProvider } from '@janus-idp/backstage-plugin-orchestrator-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addEntityProvider(
    await OrchestratorEntityProvider.fromConfig({
      config: env.config,
      logger: env.logger,
      scheduler: env.scheduler,
      discovery: env.discovery,
    }),
  );
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
