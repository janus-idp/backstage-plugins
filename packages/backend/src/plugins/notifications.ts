import { CatalogClient } from '@backstage/catalog-client';
import { createRouter } from '@backstage/plugin-notifications-backend';

import { Router } from 'express';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
  const dbConfig = env.config.getConfig('backend.database');
  return await createRouter({
    logger: env.logger,
    dbConfig,
    catalogClient,
  });
}
