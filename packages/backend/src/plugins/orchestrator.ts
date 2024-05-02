import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-orchestrator-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    catalogApi: env.catalogApi,
    urlReader: env.reader,
    scheduler: env.scheduler,
    permissions: env.permissions,
    identity: env.identity,
  });
}
