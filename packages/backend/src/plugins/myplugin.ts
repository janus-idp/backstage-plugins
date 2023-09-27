import { createRouter, RouterOptions } from '@internal/plugin-myplugin-backend';
import { Router } from 'express';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // Here is where you will add all of the required initialization code that
  // your backend plugin needs to be able to start!

  // The env contains a lot of goodies, but our router currently only
  // needs a logger
  const dbClient =
    (await env.database.getClient()) as unknown as RouterOptions['dbClient']; /* TODO: fix the type */
  return await createRouter({
    dbClient,
    logger: env.logger,
  });
}
