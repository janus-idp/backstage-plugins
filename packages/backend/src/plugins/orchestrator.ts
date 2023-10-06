import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-orchestrator-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    eventBroker: env.eventBroker,
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    catalogApi: env.catalogApi,
    urlReader: env.reader,
  });
}
