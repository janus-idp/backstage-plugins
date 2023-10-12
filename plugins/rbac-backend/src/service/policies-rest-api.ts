import {
  ConflictError,
  InputError,
  NotAllowedError,
  NotFoundError,
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
  ConditionalPolicyDecision,
  PermissionEvaluator,
  QueryPermissionRequest,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { Enforcer } from 'casbin';
import { Router } from 'express';
import { Request } from 'express-serve-static-core';
import { isEqual } from 'lodash';
import { ParsedQs } from 'qs';

import {
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  RESOURCE_TYPE_POLICY_ENTITY,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import { ConditionalStorage } from './conditional-storage';
import {
  validateEntityReference,
  validatePolicy,
  validateQueries,
  validateRole,
} from './policies-validation';

export class PolicesServer {
  constructor(
    private readonly identity: IdentityApi,
    private readonly permissions: PermissionEvaluator,
    private readonly options: RouterOptions,
    private readonly enforcer: Enforcer,
    private readonly conditionalStorage: ConditionalStorage,
  ) {}

  private async authorize(
    identity: IdentityApi,
    request: Request,
    permissionEvaluator: PermissionEvaluator,
    permission: QueryPermissionRequest,
  ) {
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
  }

  async serve(): Promise<Router> {
    const router = await createRouter(this.options);
    const permissionsIntegrationRouter = createPermissionIntegrationRouter({
      resourceType: RESOURCE_TYPE_POLICY_ENTITY,
      permissions: policyEntityPermissions,
    });

    router.use(permissionsIntegrationRouter);

    router.get('/', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityReadPermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      response.send({ status: 'Authorized' });
    });

    // Policy CRUD

    router.get('/policies', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityReadPermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      let policies: string[][];
      if (this.isPolicyFilterEnabled(request)) {
        const entityRef = this.getFirstQuery(request.query.entityRef);
        const permission = this.getFirstQuery(request.query.permission);
        const policy = this.getFirstQuery(request.query.policy);
        const effect = this.getFirstQuery(request.query.effect);

        const filter: string[] = [entityRef, permission, policy, effect];
        policies = await this.enforcer.getFilteredPolicy(0, ...filter);
      } else {
        policies = await this.enforcer.getPolicy();
      }

      response.json(this.transformPolicyArray(...policies));
    });

    router.get(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(
          this.identity,
          request,
          this.permissions,
          {
            permission: policyEntityReadPermission,
          },
        );

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const entityRef = this.getEntityReference(request);

        const policy = await this.enforcer.getFilteredPolicy(0, entityRef);
        if (policy.length !== 0) {
          response.json(this.transformPolicyArray(...policy));
        } else {
          throw new NotFoundError(); // 404
        }
      },
    );

    router.delete(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(
          this.identity,
          request,
          this.permissions,
          {
            permission: policyEntityDeletePermission,
          },
        );

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const entityRef = this.getEntityReference(request);

        const err = validateQueries(request);
        if (err) {
          throw new InputError( // 400
            `Invalid policy definition. Cause: ${err.message}`,
          );
        }

        const permission = this.getFirstQuery(request.query.permission!);
        const policy = this.getFirstQuery(request.query.policy!);
        const effect = this.getFirstQuery(request.query.effect!);

        const policyPermission = [entityRef, permission, policy, effect];

        if (!(await this.enforcer.hasPolicy(...policyPermission))) {
          throw new NotFoundError(); // 404
        }

        const isRemoved = await this.enforcer.removePolicy(...policyPermission);
        if (!isRemoved) {
          throw new Error('Unexpected error'); // 500
        }
        response.status(204).end();
      },
    );
    router.post('/policies', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityCreatePermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const policyRaw: RoleBasedPolicy = request.body;
      const err = validatePolicy(policyRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid policy definition. Cause: ${err.message}`,
        );
      }

      const policy = this.transformPolicyToArray(policyRaw);

      if (await this.enforcer.hasPolicy(...policy)) {
        throw new ConflictError(); // 409
      }

      const isAdded = await this.enforcer.addPolicy(...policy);
      if (!isAdded) {
        throw new Error('Unexpected error'); // 500
      }
      response.status(201).end();
    });

    router.put(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(
          this.identity,
          request,
          this.permissions,
          {
            permission: policyEntityUpdatePermission,
          },
        );

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const entityRef = this.getEntityReference(request);

        const oldPolicyRaw = request.body.oldPolicy;
        if (!oldPolicyRaw) {
          throw new InputError(`'oldPolicy' object must be present`); // 400
        }
        const newPolicyRaw = request.body.newPolicy;
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

        const oldPolicy = this.transformPolicyToArray(oldPolicyRaw);
        const newPolicy = this.transformPolicyToArray(newPolicyRaw);

        if (await this.enforcer.hasPolicy(...newPolicy)) {
          if (isEqual(oldPolicy, newPolicy)) {
            response.status(204).end();
            return;
          }
          throw new ConflictError(); // 409
        }

        if (!(await this.enforcer.hasPolicy(...oldPolicy))) {
          throw new NotFoundError(); // 404
        }

        // enforcer.updatePolicy(oldPolicyPermission, newPolicyPermission) was not implemented
        // for ORMTypeAdapter.
        // So, let's compensate this combination delete + create.
        const isRemoved = await this.enforcer.removePolicy(...oldPolicy);
        if (!isRemoved) {
          throw new Error('Unexpected error'); // 500
        }

        const isAdded = await this.enforcer.addPolicy(...newPolicy);
        if (!isAdded) {
          throw new Error('Unexpected error');
        }

        response.status(200).end();
      },
    );

    // Role CRUD

    router.get('/roles', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityReadPermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const roles = await this.enforcer.getGroupingPolicy();

      response.json(this.transformRoleArray(...roles));
    });

    router.get('/roles/:kind/:namespace/:name', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityReadPermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      const roleEntityRef = this.getEntityReference(request);

      const role = await this.enforcer.getFilteredGroupingPolicy(
        1,
        roleEntityRef,
      );

      if (role.length !== 0) {
        response.json(this.transformRoleArray(...role));
      } else {
        throw new NotFoundError(); // 404
      }
    });

    router.post('/roles', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityCreatePermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      const roleRaw: Role = request.body;
      const err = validateRole(roleRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid role definition. Cause: ${err.message}`,
        );
      }

      const roles = this.transformRoleToArray(roleRaw);

      for (const role in roles) {
        if (await this.enforcer.hasGroupingPolicy(...role)) {
          throw new ConflictError(); // 409
        }
      }

      const isAdded = await this.enforcer.addGroupingPolicies(roles);

      if (!isAdded) {
        throw new Error('Unexpected error'); // 500
      }
      response.status(201).end();
    });

    router.put('/roles/:kind/:namespace/:name', async (request, response) => {
      const decision = await this.authorize(
        this.identity,
        request,
        this.permissions,
        {
          permission: policyEntityUpdatePermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      const roleEntityRef = this.getEntityReference(request);

      const oldRoleRaw = request.body.oldRole;

      if (!oldRoleRaw) {
        throw new InputError(`'oldRole' object must be present`); // 400
      }
      const newRoleRaw = request.body.newRole;
      if (!newRoleRaw) {
        throw new InputError(`'newRole' object must be present`); // 400
      }

      oldRoleRaw.name = roleEntityRef;
      let err = validateRole(oldRoleRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid old role object. Cause: ${err.message}`,
        );
      }
      err = validateRole(newRoleRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid new role object. Cause: ${err.message}`,
        );
      }

      const oldRole = this.transformRoleToArray(oldRoleRaw);
      const newRole = this.transformRoleToArray(newRoleRaw);

      for (const role of newRole) {
        const hasRole = oldRole.some(element => {
          return isEqual(element, role);
        });
        // if the role is already part of old role and is a grouping policy we want to skip returning a conflict error
        // to allow for other roles to be checked and added
        if (await this.enforcer.hasGroupingPolicy(...role)) {
          if (isEqual(oldRole, newRole)) {
            response.status(204).end();
            return;
          }
          if (!hasRole) {
            throw new ConflictError(); // 409
          }
        }
      }

      for (const role of oldRole) {
        if (!(await this.enforcer.hasGroupingPolicy(...role))) {
          throw new NotFoundError(); // 404
        }
      }

      // enforcer.updateGroupingPolicy(oldRole, newRole) was not implemented
      // for ORMTypeAdapter.
      // So, let's compensate this combination delete + create.
      const isRemoved = await this.enforcer.removeGroupingPolicies(oldRole);
      if (!isRemoved) {
        throw new Error('Unexpected error'); // 500
      }

      const isAdded = await this.enforcer.addGroupingPolicies(newRole);
      if (!isAdded) {
        throw new Error('Unexpected error');
      }

      response.status(200).end();
    });

    router.delete(
      '/roles/:kind/:namespace/:name',
      async (request, response) => {
        let roles = [];
        const decision = await this.authorize(
          this.identity,
          request,
          this.permissions,
          {
            permission: policyEntityDeletePermission,
          },
        );

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const roleEntityRef = this.getEntityReference(request);

        if (request.query.memberReferences) {
          const memberReferences = this.getFirstQuery(
            request.query.memberReferences!,
          );

          roles.push([memberReferences, roleEntityRef]);
        } else {
          roles = await this.enforcer.getFilteredGroupingPolicy(
            1,
            roleEntityRef,
          );
        }

        for (const role of roles) {
          if (!(await this.enforcer.hasGroupingPolicy(...role))) {
            throw new NotFoundError(); // 404
          }
        }

        const isRemoved = await this.enforcer.removeGroupingPolicies(roles);
        if (!isRemoved) {
          throw new Error('Unexpected error'); // 500
        }
        response.status(204).end();
      },
    );
    // todo: implement GET list all conditions. Also we need to have filter by pluginId and resource type.

    router.post('/conditions', async (req, resp) => {
      const decision = await this.authorize(
        this.identity,
        req,
        this.permissions,
        {
          permission: policyEntityCreatePermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const conditionalPolicy: ConditionalPolicyDecision = req.body;
      // TODO add validation.
      const id =
        await this.conditionalStorage.createCondition(conditionalPolicy);

      resp.status(201).json({ id: id });
    });

    router.get('/conditions/:id', async (req, resp) => {
      const decision = await this.authorize(
        this.identity,
        req,
        this.permissions,
        {
          permission: policyEntityReadPermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(req.params.id, 10);

      const condition = await this.conditionalStorage.getCondition(id);
      if (!condition) {
        throw new NotFoundError();
      }

      resp.json(condition);
    });

    router.delete('/conditions/:id', async (req, resp) => {
      const decision = await this.authorize(
        this.identity,
        req,
        this.permissions,
        {
          permission: policyEntityDeletePermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(req.params.id, 10);

      await this.conditionalStorage.deleteCondition(id);
      resp.status(204).end();
    });

    router.put('/conditions/:id', async (req, resp) => {
      const decision = await this.authorize(
        this.identity,
        req,
        this.permissions,
        {
          permission: policyEntityUpdatePermission,
        },
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(req.params.id, 10);
      const conditionalPolicy: ConditionalPolicyDecision = req.body;

      await this.conditionalStorage.updateCondition(id, conditionalPolicy);
      resp.status(200).end();
    });

    return router;
  }

  getEntityReference(request: Request): string {
    const kind = request.params.kind;
    const namespace = request.params.namespace;
    const name = request.params.name;
    const entityRef = `${kind}:${namespace}/${name}`;

    const err = validateEntityReference(entityRef);
    if (err) {
      throw new InputError(err.message);
    }

    return entityRef;
  }

  transformPolicyArray(...policies: string[][]): RoleBasedPolicy[] {
    return policies.map((p: string[]) => {
      const [entityReference, permission, policy, effect] = p;
      return { entityReference, permission, policy, effect };
    });
  }

  transformRoleArray(...roles: string[][]): Role[] {
    const combinedRoles: { [key: string]: string[] } = {};

    roles.forEach(([value, role]) => {
      if (combinedRoles.hasOwnProperty(role)) {
        combinedRoles[role].push(value);
      } else {
        combinedRoles[role] = [value];
      }
    });

    const result: Role[] = Object.entries(combinedRoles).map(
      ([role, value]) => {
        return { memberReferences: value, name: role };
      },
    );
    return result;
  }

  transformPolicyToArray(policy: RoleBasedPolicy): string[] {
    return [
      policy.entityReference!,
      policy.permission!,
      policy.policy!,
      policy.effect!,
    ];
  }

  transformRoleToArray(role: Role): string[][] {
    const roles: string[][] = [];
    for (const entity of role.memberReferences) {
      roles.push([entity, role.name]);
    }
    return roles;
  }

  getFirstQuery(
    queryValue: string | string[] | ParsedQs | ParsedQs[] | undefined,
  ): string {
    if (!queryValue) {
      return '';
    }
    if (Array.isArray(queryValue)) {
      if (typeof queryValue[0] === 'string') {
        return queryValue[0].toString();
      }
      throw new InputError(`This api doesn't support nested query`);
    }

    if (typeof queryValue === 'string') {
      return queryValue;
    }
    throw new InputError(`This api doesn't support nested query`);
  }

  isPolicyFilterEnabled(request: Request): boolean {
    return (
      !!request.query.entityRef ||
      !!request.query.permission ||
      !!request.query.policy ||
      !!request.query.effect
    );
  }
}
