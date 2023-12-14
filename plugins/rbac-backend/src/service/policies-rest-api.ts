import { PluginEndpointDiscovery } from '@backstage/backend-common';
import { Config } from '@backstage/config';
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
  PolicyDecision,
  QueryPermissionRequest,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { Enforcer } from 'casbin';
import { Router } from 'express';
import { Request } from 'express-serve-static-core';
import { isEmpty, isEqual } from 'lodash';
import { ParsedQs } from 'qs';
import { Logger } from 'winston';

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

import { ConditionalStorage } from '../database/conditional-storage';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import {
  validateEntityReference,
  validatePolicy,
  validateRole,
} from './policies-validation';
import { PluginIdProvider } from './policy-builder';

export class PolicesServer {
  constructor(
    private readonly identity: IdentityApi,
    private readonly permissions: PermissionEvaluator,
    private readonly options: RouterOptions,
    private readonly enforcer: Enforcer,
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly discovery: PluginEndpointDiscovery,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly pluginIdProvider: PluginIdProvider,
  ) {}

  private async authorize(
    request: Request,
    permission: QueryPermissionRequest,
  ): Promise<PolicyDecision> {
    if (permission.permission !== policyEntityReadPermission) {
      const user = await this.identity.getIdentity({ request });
      if (!user) {
        throw new NotAllowedError('User not found');
      }
    }
    const authHeader = request.header('authorization');
    const token = getBearerTokenFromAuthorizationHeader(authHeader);

    const decision = (
      await this.permissions.authorizeConditional([permission], { token })
    )[0];

    return decision;
  }

  async serve(): Promise<Router> {
    const router = await createRouter(this.options);
    const permissionsIntegrationRouter = createPermissionIntegrationRouter({
      resourceType: RESOURCE_TYPE_POLICY_ENTITY,
      permissions: policyEntityPermissions,
    });

    const pluginPermMetaData = new PluginPermissionMetadataCollector(
      this.discovery,
      this.pluginIdProvider,
      this.config,
      this.logger,
    );

    router.use(permissionsIntegrationRouter);

    router.get('/', async (request, response) => {
      const decision = await this.authorize(request, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      response.send({ status: 'Authorized' });
    });

    // Policy CRUD

    router.get('/policies', async (request, response) => {
      const decision = await this.authorize(request, {
        permission: policyEntityReadPermission,
      });

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
        const decision = await this.authorize(request, {
          permission: policyEntityReadPermission,
        });

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
        const decision = await this.authorize(request, {
          permission: policyEntityDeletePermission,
        });

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const entityRef = this.getEntityReference(request);

        const policyRaw: RoleBasedPolicy[] = request.body;
        if (isEmpty(policyRaw)) {
          throw new InputError(`permission policy must be present`); // 400
        }

        policyRaw.forEach(element => {
          element.entityReference = entityRef;
        });

        const processedPolicies = await this.processPolicies(policyRaw, true);

        const isRemoved = await this.enforcer.removePolicies(processedPolicies);
        if (!isRemoved) {
          throw new Error('Unexpected error'); // 500
        }
        response.status(204).end();
      },
    );

    router.post('/policies', async (request, response) => {
      const decision = await this.authorize(request, {
        permission: policyEntityCreatePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const policyRaw: RoleBasedPolicy[] = request.body;

      if (isEmpty(policyRaw)) {
        throw new InputError(`permission policy must be present`); // 400
      }

      const processedPolicies = await this.processPolicies(policyRaw);

      const isAdded = await this.enforcer.addPolicies(processedPolicies);
      if (!isAdded) {
        throw new Error('Unexpected error'); // 500
      }
      response.status(201).end();
    });

    router.put(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(request, {
          permission: policyEntityUpdatePermission,
        });

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const entityRef = this.getEntityReference(request);

        const oldPolicyRaw: RoleBasedPolicy[] = request.body.oldPolicy;
        if (isEmpty(oldPolicyRaw)) {
          throw new InputError(`'oldPolicy' object must be present`); // 400
        }
        const newPolicyRaw: RoleBasedPolicy[] = request.body.newPolicy;
        if (isEmpty(newPolicyRaw)) {
          throw new InputError(`'newPolicy' object must be present`); // 400
        }

        [...oldPolicyRaw, ...newPolicyRaw].forEach(element => {
          element.entityReference = entityRef;
        });

        const processedOldPolicy = await this.processPolicies(
          oldPolicyRaw,
          true,
          'old policy',
        );

        oldPolicyRaw.sort((a, b) =>
          a.permission === b.permission
            ? this.nameSort(a.policy!, b.policy!)
            : this.nameSort(a.permission!, b.permission!),
        );

        newPolicyRaw.sort((a, b) =>
          a.permission === b.permission
            ? this.nameSort(a.policy!, b.policy!)
            : this.nameSort(a.permission!, b.permission!),
        );

        if (
          isEqual(oldPolicyRaw, newPolicyRaw) &&
          !oldPolicyRaw.some(isEmpty)
        ) {
          response.status(204).end();
        } else if (oldPolicyRaw.length > newPolicyRaw.length) {
          throw new InputError(
            `'oldPolicy' object has more permission policies compared to 'newPolicy' object`,
          );
        }

        const processedNewPolicy = await this.processPolicies(
          newPolicyRaw,
          false,
          'new policy',
        );

        // enforcer.updatePolicy(oldPolicyPermission, newPolicyPermission) was not implemented
        // for ORMTypeAdapter.
        // So, let's compensate this combination delete + create.
        const isRemoved =
          await this.enforcer.removePolicies(processedOldPolicy);
        if (!isRemoved) {
          throw new Error('Unexpected error'); // 500
        }

        const isAdded = await this.enforcer.addPolicies(processedNewPolicy);
        if (!isAdded) {
          throw new Error('Unexpected error');
        }

        response.status(200).end();
      },
    );

    // Role CRUD

    router.get('/roles', async (request, response) => {
      const decision = await this.authorize(request, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const roles = await this.enforcer.getGroupingPolicy();

      response.json(this.transformRoleArray(...roles));
    });

    router.get('/roles/:kind/:namespace/:name', async (request, response) => {
      const decision = await this.authorize(request, {
        permission: policyEntityReadPermission,
      });

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
      const uniqueItems = new Set<string>();
      const decision = await this.authorize(request, {
        permission: policyEntityCreatePermission,
      });

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

      for (const role of roles) {
        if (await this.enforcer.hasGroupingPolicy(...role)) {
          throw new ConflictError(); // 409
        }
        const roleString = JSON.stringify(role);

        if (uniqueItems.has(roleString)) {
          throw new ConflictError(
            `Duplicate role members found; ${role.at(0)}, ${role.at(
              1,
            )} is a duplicate`,
          );
        } else {
          uniqueItems.add(roleString);
        }
      }

      const isAdded = await this.enforcer.addGroupingPolicies(roles);

      if (!isAdded) {
        throw new Error('Unexpected error'); // 500
      }
      response.status(201).end();
    });

    router.put('/roles/:kind/:namespace/:name', async (request, response) => {
      const uniqueItems = new Set<string>();
      const decision = await this.authorize(request, {
        permission: policyEntityUpdatePermission,
      });

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
        const roleString = JSON.stringify(role);

        if (uniqueItems.has(roleString)) {
          throw new ConflictError(
            `Duplicate role members found; ${role.at(0)}, ${role.at(
              1,
            )} is a duplicate`,
          );
        } else {
          uniqueItems.add(roleString);
        }
      }

      uniqueItems.clear();
      for (const role of oldRole) {
        if (!(await this.enforcer.hasGroupingPolicy(...role))) {
          throw new NotFoundError(); // 404
        }
        const roleString = JSON.stringify(role);

        if (uniqueItems.has(roleString)) {
          throw new ConflictError(
            `Duplicate role members found; ${role.at(0)}, ${role.at(
              1,
            )} is a duplicate`,
          );
        } else {
          uniqueItems.add(roleString);
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
        const decision = await this.authorize(request, {
          permission: policyEntityDeletePermission,
        });

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

    router.get('/plugins/policies', async (req, resp) => {
      const decision = await this.authorize(req, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const policies = await pluginPermMetaData.getPluginPolicies();
      resp.json(policies);
    });

    router.get('/plugins/condition-rules', async (req, resp) => {
      const decision = await this.authorize(req, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const rules = await pluginPermMetaData.getPluginConditionRules();
      resp.json(rules);
    });

    router.get('/conditions', async (req, resp) => {
      const decision = await this.authorize(req, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const pluginId = this.getFirstQuery(req.query.pluginId);
      const resourceType = this.getFirstQuery(req.query.resourceType);
      const conditions = await this.conditionalStorage.getConditions(
        pluginId,
        resourceType,
      );

      resp.json(conditions);
    });

    router.post('/conditions', async (req, resp) => {
      const decision = await this.authorize(req, {
        permission: policyEntityCreatePermission,
      });

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
      const decision = await this.authorize(req, {
        permission: policyEntityReadPermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new InputError('Id is not a valid number.');
      }

      const condition = await this.conditionalStorage.getCondition(id);
      if (!condition) {
        throw new NotFoundError();
      }

      resp.json(condition);
    });

    router.delete('/conditions/:id', async (req, resp) => {
      const decision = await this.authorize(req, {
        permission: policyEntityDeletePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new InputError('Id is not a valid number.');
      }

      await this.conditionalStorage.deleteCondition(id);
      resp.status(204).end();
    });

    router.put('/conditions/:id', async (req, resp) => {
      const decision = await this.authorize(req, {
        permission: policyEntityUpdatePermission,
      });

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new InputError('Id is not a valid number.');
      }
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

  async processPolicies(
    policyArray: RoleBasedPolicy[],
    isOld?: boolean,
    errorMessage?: string,
  ): Promise<string[][]> {
    const policies: string[][] = [];
    const uniqueItems = new Set<string>();
    for (const policy of policyArray) {
      const err = validatePolicy(policy);
      if (err) {
        throw new InputError(
          `Invalid ${errorMessage || 'policy'} definition. Cause: ${
            err.message
          }`,
        ); // 400
      }

      const transformedPolicy = this.transformPolicyToArray(policy);

      if (isOld && !(await this.enforcer.hasPolicy(...transformedPolicy))) {
        throw new NotFoundError(); // 404
      }

      if (!isOld && (await this.enforcer.hasPolicy(...transformedPolicy))) {
        throw new ConflictError(); // 409
      }

      // We want to ensure that there are not duplicate permission policies
      const rowString = JSON.stringify(transformedPolicy);
      if (uniqueItems.has(rowString)) {
        throw new ConflictError(
          `Duplicate polices found; ${policy.entityReference}, ${policy.permission}, ${policy.policy}, ${policy.effect} is a duplicate`,
        );
      } else {
        uniqueItems.add(rowString);
        policies.push(transformedPolicy);
      }
    }
    return policies;
  }

  nameSort(nameA: string, nameB: string): number {
    if (nameA.toUpperCase() < nameB.toUpperCase()) {
      return -1;
    }
    if (nameA.toUpperCase() > nameB.toUpperCase()) {
      return 1;
    }
    return 0;
  }
}
