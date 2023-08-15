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
  QueryPermissionRequest,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import { Router } from 'express';
import { Logger } from 'winston';

import {
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  RESOURCE_TYPE_POLICY_ENTITY,
} from '../permissions';
import { CasbinDBAdapterFactory } from './casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';

export const MODEL = `
[request_definition]
r = sub, obj, act
[policy_definition]
p = sub, obj, act, eft
[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))
[role_definition]
g = _, _
[matchers]
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
`;

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

    const enf = await newEnforcer(newModelFromString(MODEL), adapter);
    await enf.loadPolicy();
    await enf.enableAutoSave(true);

    const authorize = async (
      authHeader: string | undefined,
      permissionEvaluator: PermissionEvaluator,
      permission: QueryPermissionRequest,
    ) => {
      const token = getBearerTokenFromAuthorizationHeader(authHeader);

      const decision = (
        await permissionEvaluator.authorizeConditional([permission], { token })
      )[0];

      return decision;
    };

    const options: RouterOptions = {
      config: env.config,
      logger: env.logger,
      discovery: env.discovery,
      identity: env.identity,
      policy: await RBACPermissionPolicy.build(env.logger, env.config, enf),
    };

    const router = await createRouter(options);

    const permissionsIntegrationRouter = createPermissionIntegrationRouter({
      resourceType: RESOURCE_TYPE_POLICY_ENTITY,
      permissions: policyEntityPermissions,
    });

    router.use(permissionsIntegrationRouter);

    router.get('/', async (request, response) => {
      const decision = await authorize(
        request.header('authorization'),
        permissions,
        { permission: policyEntityReadPermission },
      );

      if (decision.result === AuthorizeResult.DENY) {
        response.status(403);
        response.send({ status: 'Unauthorized' });
      } else {
        response.send({ status: 'Authorized' });
      }
    });

    router.get('/policies', async (request, response) => {
      const decision = await authorize(
        request.header('authorization'),
        permissions,
        { permission: policyEntityReadPermission },
      );

      if (decision.result === AuthorizeResult.DENY) {
        response.status(403);
        response.send({ status: 'Unauthorized' });
      } else {
        const policies = await enf.getPolicy();
        response.json(policies);
      }
    });

    router.get('/policy/:namespace/:id', async (request, response) => {
      const str = request.params.namespace.concat('/');
      const user = str + request.params.id;

      const decision = await authorize(
        request.header('authorization'),
        permissions,
        { permission: policyEntityReadPermission },
      );

      if (decision.result === AuthorizeResult.DENY) {
        response.status(403);
        response.send({ status: 'Unauthorized' });
      } else {
        const policy = await enf.getFilteredPolicy(0, user);
        if (!(policy.length === 0)) {
          response.json(policy);
        } else {
          response.status(404).end();
        }
      }
    });

    router.delete('/policy', async (request, response) => {
      const policy = request.body;

      const decision = await authorize(
        request.header('authorization'),
        permissions,
        { permission: policyEntityDeletePermission },
      );

      if (decision.result === AuthorizeResult.DENY) {
        response.status(403);
        response.send({ status: 'Unauthorized' });
      } else {
        const policyPermission = [
          policy.user,
          policy.permission,
          policy.policy,
          policy.effect,
        ];
        await enf.removePolicy(...policyPermission);
        response.status(200).end();
      }
    });

    router.post('/policy', async (request, response) => {
      const policy = request.body;

      const decision = await authorize(
        request.header('authorization'),
        permissions,
        { permission: policyEntityCreatePermission },
      );

      if (decision.result === AuthorizeResult.DENY) {
        response.status(403);
        response.send({ status: 'Unauthorized' });
      } else {
        const policyPermission = [
          policy.user,
          policy.permission,
          policy.policy,
          policy.effect,
        ];

        if (!(await enf.hasPolicy(...policyPermission))) {
          await enf.addPolicy(...policyPermission);
          response.status(201).end();
        } else {
          response.status(409).end();
        }
      }
    });

    return router;
  }
}
