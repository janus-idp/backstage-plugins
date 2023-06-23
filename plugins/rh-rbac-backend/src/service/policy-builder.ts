import {
  PluginEndpointDiscovery,
  resolvePackagePath,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import {
  createRouter,
  RouterOptions,
} from '@backstage/plugin-permission-backend';

import { FileAdapter } from 'casbin';
import { Router } from 'express';
import { Logger } from 'winston';

import { RBACPermissionPolicy } from './permission-policy';

export class PolicyBuilder {
  public static async build(env: {
    config: Config;
    logger: Logger;
    discovery: PluginEndpointDiscovery;
    identity: IdentityApi;
  }): Promise<Router> {
    // TODO: Replace with a DB adapter.
    const fileAdapter = new FileAdapter(
      resolvePackagePath(
        '@janus-idp/plugin-rh-rbac-backend',
        './model/rbac-policy.csv',
      ),
    );

    const options: RouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      identity: env.identity,
      policy: await RBACPermissionPolicy.build(env.logger, fileAdapter),
    };
    return createRouter(options);
  }
}
