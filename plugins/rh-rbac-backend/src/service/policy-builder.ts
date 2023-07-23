import {
  PluginDatabaseManager,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';
import { parseEntityRef } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  ConflictError,
  InputError,
  NotAllowedError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
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
import { Request } from 'express-serve-static-core';
import { Logger } from 'winston';

import {
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  RESOURCE_TYPE_POLICY_ENTITY,
} from '../permissions';
import { CasbinAdapterFactory } from './casbin-adapter-factory';
import { MODEL } from './permission-model';
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
    const permissions = env.permissions;
    const adapter = await new CasbinAdapterFactory(
      env.config,
      env.database,
    ).createAdapter();

    const theModel = newModelFromString(MODEL);
    const enforcer = await newEnforcer(theModel, adapter);
    await enforcer.loadPolicy();
    await enforcer.enableAutoSave(true);

    const authorize = async (
      identity: IdentityApi,
      request: Request,
      permissionEvaluator: PermissionEvaluator,
      permission: QueryPermissionRequest,
    ) => {
      const user = await identity.getIdentity({ request });
      if (!user) {
        throw new NotAllowedError();
      }

      const authHeader = request.header('authorization');
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
      const decision = await authorize(env.identity, request, permissions, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      response.send({ status: 'Authorized' });
    });

    // todo: add filter query
    router.get('/policies', async (request, response) => {
      const decision = await authorize(env.identity, request, permissions, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const policies = await enforcer.getPolicy();
      response.json(transformPolicyArray(...policies));
    });

    router.get('/policy/:namespace/:id', async (request, response) => {
      const decision = await authorize(env.identity, request, permissions, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const entityRef = getEntityReference(request);
      const policy = await enforcer.getFilteredPolicy(0, entityRef);
      if (!(policy.length === 0)) {
        response.json(transformPolicyArray(...policy));
      } else {
        throw new NotFoundError(); // 404
      }
    });

    router.delete('/policy/:namespace/:id', async (request, response) => {
      const decision = await authorize(env.identity, request, permissions, {
        permission: policyEntityDeletePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const entityRef = getEntityReference(request);

      // todo check validation one more time....
      const err = validatePolicyQueries(request);
      if (err) {
        throw new InputError( // 400
          `Invalid policy definition. Cause: ${err.message}`,
        );
      }

      const permission = request.query.permission!.toString();
      const policy = request.query.policy!.toString();
      const effect = request.query.effect!.toString();

      const policyPermission = [entityRef, permission, policy, effect];

      if (!(await enforcer.hasPolicy(...policyPermission))) {
        throw new NotFoundError(); // 404
      }

      const isRemoved = await enforcer.removePolicy(...policyPermission);
      if (!isRemoved) {
        throw new ServiceUnavailableError(); // 500
      }
      response.status(204).end();
    });

    router.post('/policy', async (request, response) => {
      const decision = await authorize(env.identity, request, permissions, {
        permission: policyEntityCreatePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const policyRaw: PolicyMetadata = request.body;
      const err = validatePolicy(policyRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid policy definition. Cause: ${err.message}`,
        );
      }

      const policy = transformPolicyToArray(policyRaw);

      if (await enforcer.hasPolicy(...policy)) {
        throw new ConflictError(); // 409
      }

      const isAdded = await enforcer.addPolicy(...policy);
      if (!isAdded) {
        throw new ServiceUnavailableError(); // 500
      }
      response.status(201).end();
    });

    router.put('/policy', async (req, resp) => {
      const decision = await authorize(env.identity, req, permissions, {
        permission: policyEntityUpdatePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const oldPolicyRaw = req.body.oldPolicy;
      if (!oldPolicyRaw) {
        throw new InputError(`'oldPolicy' object must be present`); // 400
      }
      const newPolicyRaw = req.body.newPolicy;
      if (!newPolicyRaw) {
        throw new InputError(`'newPolicy' object must be present`); // 400
      }

      let err = validatePolicy(oldPolicyRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid old policy object. Cause: ${err.message}`,
        );
      }
      err = validatePolicy(newPolicyRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid new policy object. Cause: ${err.message}`,
        );
      }

      // todo: don't allow to change entityReference. That's policy transition, not sure
      // that we would like to support it.
      // todo: handle situation, when oldPolicyPermission is equal newPolicyPermission.

      const oldPolicy = transformPolicyToArray(oldPolicyRaw);
      const newPolicy = transformPolicyToArray(newPolicyRaw);

      if (await enforcer.hasPolicy(...newPolicy)) {
        throw new ConflictError(); // 409
      }

      if (!(await enforcer.hasPolicy(...oldPolicy))) {
        throw new NotFoundError(); // 404
      }

      // enforcer.updatePolicy(oldPolicyPermission, newPolicyPermission) was not implemented
      // for ORMTypeAdapter.
      // So, let's compensate this combination delete + create.
      const isRemoved = await enforcer.removePolicy(...oldPolicy);
      if (!isRemoved) {
        throw new ServiceUnavailableError(); // 500
      }
      const isAdded = await enforcer.addPolicy(...newPolicy);
      if (!isAdded) {
        throw new ServiceUnavailableError(); // 500
      }

      resp.status(201).end();
    });

    return router;
  }
}

function getEntityReference(req: Request): string {
  const str = req.params.namespace.concat('/');
  return str + req.params.id;
}

function validatePolicyQueries(request: Request): Error | undefined {
  if (!request.query.permission) {
    return new Error('specify "permission" query param.');
  }

  if (!request.query.policy) {
    return new Error('specify "policy" query param.');
  }

  if (!request.query.effect) {
    return new Error('specify "effect" query param.');
  }

  return undefined;
}

function validatePolicy(policy: PolicyMetadata): Error | undefined {
  if (!policy.entityReference) {
    throw new Error(`'entityReference' must not be empty`);
  }

  try {
    parseEntityRef(policy.entityReference!);
  } catch (error) {
    return error as Error;
  }

  if (!policy.permission) {
    throw new Error(`'permission' field must not be empty`);
  }

  if (!policy.policy) {
    throw new Error(`'policy' field must not be empty`);
  }

  if (!policy.effect) {
    // todo check if effect should be 'allow' or 'deny'
    throw new Error(`'effect' field must not be empty`);
  }

  return undefined;
}

function transformPolicyArray(...policies: string[][]): PolicyMetadata[] {
  return policies.map((p: string[]) => {
    const [entityReference, permission, policy, effect] = p;
    return { entityReference, permission, policy, effect };
  });
}

function transformPolicyToArray(policy: PolicyMetadata) {
  return [
    policy.entityReference!,
    policy.permission!,
    policy.policy!,
    policy.effect!,
  ];
}

export type PolicyMetadata = {
  entityReference: string | undefined;
  permission: string | undefined;
  policy: string | undefined;
  effect: string | undefined;
};

export type UpdatePolicyMetadata = {
  oldPolicy: PolicyMetadata;
  newPolicy: PolicyMetadata;
};
