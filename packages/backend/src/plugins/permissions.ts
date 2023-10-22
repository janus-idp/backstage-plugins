import { Router } from 'express';

import { PolicyBuilder } from '@janus-idp/backstage-plugin-rbac-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return PolicyBuilder.build({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    identity: env.identity,
    permissions: env.permissions,
    database: env.database,
    tokenManager: env.tokenManager,
  });
}
