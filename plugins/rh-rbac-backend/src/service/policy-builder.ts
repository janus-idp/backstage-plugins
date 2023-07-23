import {
  PluginDatabaseManager,
  PluginEndpointDiscovery,
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

import { newEnforcer, newModelFromString } from 'casbin';
import { Router } from 'express';
import { Logger } from 'winston';

import {
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  RESOURCE_TYPE_POLICY_ENTITY,
} from '../permissions';
import { CasbinAdapterFactory } from './casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';

const MODEL = `
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
    const permissions = env.permissions;
    const adapter = await new CasbinAdapterFactory(
      env.config,
      env.database,
    ).createAdapter();

    const theModel = newModelFromString(MODEL);
    const enforcer = await newEnforcer(theModel, adapter);

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
      policy: await RBACPermissionPolicy.build(
        env.logger,
        env.config,
        enforcer,
      ),
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
        const policies = await enforcer.getPolicy();
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
        const policy = await enforcer.getFilteredPolicy(0, user);
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
        await enforcer.removePolicy(...policyPermission);
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

        if (!(await enforcer.hasPolicy(...policyPermission))) {
          await enforcer.addPolicy(...policyPermission);
          response.status(201).end();
        } else {
          response.status(409).end();
        }
      }
    });

    return router;
  }
}
