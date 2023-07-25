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
import { isEqual } from 'lodash';
import { ParsedQs } from 'qs';
import { Logger } from 'winston';

import {
  EntityReferencedPolicy,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  RESOURCE_TYPE_POLICY_ENTITY,
} from '@janus-idp/plugin-rh-rbac-common';

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

    router.get('/policies', async (req, response) => {
      const decision = await authorize(env.identity, req, permissions, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      let policies: string[][];
      if (isPolicyFilterEnabled(req)) {
        const entityRef = getFirstQuery(req.query.entityRef);
        const permission = getFirstQuery(req.query.permission);
        const policy = getFirstQuery(req.query.policy);
        const effect = getFirstQuery(req.query.effect);

        const filter: string[] = [entityRef, permission, policy, effect];
        policies = await enforcer.getFilteredPolicy(0, ...filter);
      } else {
        policies = await enforcer.getPolicy();
      }

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
      let err = validateEntityReference(entityRef);
      if (err) {
        throw new InputError(`Invalid url: ${err.message}`); // 400
      }

      err = validatePolicyQueries(request);
      if (err) {
        throw new InputError( // 400
          `Invalid policy definition. Cause: ${err.message}`,
        );
      }

      const permission = getFirstQuery(request.query.permission!);
      const policy = getFirstQuery(request.query.policy!);
      const effect = getFirstQuery(request.query.effect!);

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

      const policyRaw: EntityReferencedPolicy = request.body;
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

    router.put('/policy/:namespace/:id', async (req, resp) => {
      const decision = await authorize(env.identity, req, permissions, {
        permission: policyEntityUpdatePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const entityRef = getEntityReference(req);

      const oldPolicyRaw = req.body.oldPolicy;
      if (!oldPolicyRaw) {
        throw new InputError(`'oldPolicy' object must be present`); // 400
      }
      const newPolicyRaw = req.body.newPolicy;
      if (!newPolicyRaw) {
        throw new InputError(`'newPolicy' object must be present`); // 400
      }

      oldPolicyRaw.entityReference = entityRef;
      let err = validatePolicy(oldPolicyRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid old policy object. Cause: ${err.message}`,
        );
      }
      newPolicyRaw.entityReference = entityRef;
      err = validatePolicy(newPolicyRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid new policy object. Cause: ${err.message}`,
        );
      }

      const oldPolicy = transformPolicyToArray(oldPolicyRaw);
      const newPolicy = transformPolicyToArray(newPolicyRaw);

      if (await enforcer.hasPolicy(...newPolicy)) {
        if (isEqual(oldPolicy, newPolicy)) {
          resp.status(204).end();
          return;
        }
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

function validatePolicy(policy: EntityReferencedPolicy): Error | undefined {
  const err = validateEntityReference(policy.entityReference);
  if (err) {
    return err;
  }

  if (!policy.permission) {
    return new Error(`'permission' field must not be empty`);
  }

  if (!policy.policy) {
    return new Error(`'policy' field must not be empty`);
  }

  if (!policy.effect) {
    // todo check if effect should be 'allow' or 'deny'
    return new Error(`'effect' field must not be empty`);
  }

  return undefined;
}

function validateEntityReference(entityRef?: string): Error | undefined {
  if (!entityRef) {
    return new Error(`'entityReference' must not be empty`);
  }
  try {
    parseEntityRef(entityRef);
  } catch (error) {
    return error as Error;
  }
  return undefined;
}

function transformPolicyArray(
  ...policies: string[][]
): EntityReferencedPolicy[] {
  return policies.map((p: string[]) => {
    const [entityReference, permission, policy, effect] = p;
    return { entityReference, permission, policy, effect };
  });
}

function transformPolicyToArray(policy: EntityReferencedPolicy) {
  return [
    policy.entityReference!,
    policy.permission!,
    policy.policy!,
    policy.effect!,
  ];
}

function getFirstQuery(
  queryValue: string | string[] | ParsedQs | ParsedQs[] | undefined,
): string {
  if (!queryValue) {
    return '';
  }
  if (Array.isArray(queryValue)) {
    if (typeof queryValue[0] === 'string') {
      // return queryValue[0]
      return queryValue.toString();
    }
    throw new InputError(`This api doesn't support nested query`);
  }

  if (typeof queryValue === 'string') {
    return queryValue;
  }
  throw new InputError(`This api doesn't support nested query`);
}

function isPolicyFilterEnabled(req: Request): boolean {
  return (
    !!req.query.entityRef ||
    !!req.query.permission ||
    !!req.query.policy ||
    !!req.query.effect
  );
}
