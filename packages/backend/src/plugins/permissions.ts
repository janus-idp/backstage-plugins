import { Router } from 'express';

import {
  PluginIdProvider,
  PolicyBuilder,
} from '@janus-idp/backstage-plugin-rbac-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
  pluginIdProvider: PluginIdProvider,
): Promise<Router> {
  return PolicyBuilder.build(
    {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      identity: env.identity,
      permissions: env.permissions,
      tokenManager: env.tokenManager,
    },
    pluginIdProvider,
  );
}
