import {
  PluginDatabaseManager,
  PluginEndpointDiscovery,
  resolvePackagePath,
} from '@backstage/backend-common';
import { Config } from '@backstage/config';
import {
  getBearerTokenFromAuthorizationHeader,
  IdentityApi,
} from '@backstage/plugin-auth-node';
import {
  createRouter,
  RouterOptions,
} from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { FileAdapter } from 'casbin';
import { Router } from 'express';
import { Logger } from 'winston';

import {
  policyEntityPermissions,
  policyEntityReadPermission,
  RESOURCE_TYPE_POLICY_ENTITY,
} from '../permissions';
import { CasbinDBAdapterFactory } from './casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';

export class PolicyBuilder {
  public static async build(env: {
    config: Config;
    logger: Logger;
    discovery: PluginEndpointDiscovery;
    identity: IdentityApi;
    permissions: PermissionEvaluator;
    database: PluginDatabaseManager;
  }): Promise<Router> {
    let adapter;
    const databaseEnabled = env.config.getOptionalBoolean(
      'permission.rbac.database.enabled',
    );

    const permissions = env.permissions;

    // Database adapter work
    if (databaseEnabled) {
      adapter = await new CasbinDBAdapterFactory(
        env.config,
        env.database,
      ).createAdapter();
    } else {
      adapter = new FileAdapter(
        resolvePackagePath(
          '@janus-idp/plugin-rh-rbac-backend',
          './model/rbac-policy.csv',
        ),
      );
    }

    const options: RouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      identity: env.identity,
      policy: await RBACPermissionPolicy.build(env.logger, adapter, env.config),
    };

    const router = await createRouter(options);

    const permissionsIntegrationRouter = createPermissionIntegrationRouter({
      resourceType: RESOURCE_TYPE_POLICY_ENTITY,
      permissions: policyEntityPermissions,
    });

    router.use(permissionsIntegrationRouter);

    router.get('/', async (request, response) => {
      const token = getBearerTokenFromAuthorizationHeader(
        request.header('authorization'),
      );

      const decision = (
        await permissions.authorizeConditional(
          [{ permission: policyEntityReadPermission }],
          {
            token,
          },
        )
      )[0];

      if (decision.result === AuthorizeResult.DENY) {
        response.status(403);
        response.send({ status: 'Unauthorized' });
      } else {
        response.send({ status: 'Authorized' });
      }
    });

    return router;
  }
}
