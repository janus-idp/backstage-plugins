import {
  createRouter,
  defaultAuthProviderFactories,
  providers,
} from '@backstage/plugin-auth-backend';

import { Router } from 'express';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    discovery: env.discovery,
    tokenManager: env.tokenManager,
    providerFactories: {
      ...defaultAuthProviderFactories,

      github: providers.github.create({
        signIn: {
          resolver: providers.github.resolvers.usernameMatchingUserEntityName(),
        },
      }),
      bitbucket: providers.bitbucket.create({
        signIn: {
          resolver:
            providers.bitbucket.resolvers.usernameMatchingUserEntityAnnotation(),
        },
      }),
    },
  });
}
