import { CatalogClient } from '@backstage/catalog-client';

import { createRouter } from '@internal/plugin-notifications-backend';
import { Router } from 'express';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // Here is where you will add all of the required initialization code that
  // your backend plugin needs to be able to start!

  const catalogClient = new CatalogClient({ discoveryApi: env.discovery });
  const dbConfig = env.config.getConfig('backend.database');
  return await createRouter({
    logger: env.logger,
    dbConfig,
    catalogClient,
  });
}
