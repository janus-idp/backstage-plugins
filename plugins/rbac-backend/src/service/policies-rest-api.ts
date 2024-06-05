import {
  AuthService,
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  ConflictError,
  InputError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';
import { IdentityApi } from '@backstage/plugin-auth-node';
import {
  createRouter,
  RouterOptions,
} from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  createPermissionIntegrationRouter,
  MetadataResponse,
} from '@backstage/plugin-permission-node';

import express from 'express';
import { Request } from 'express-serve-static-core';
import { isEmpty, isEqual } from 'lodash';
import { ParsedQs } from 'qs';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  PermissionInfo,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  RESOURCE_TYPE_POLICY_ENTITY,
  Role,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';
import { PluginIdProvider } from '@janus-idp/backstage-plugin-rbac-node';

import {
  ConditionEvents,
  ListConditionEvents,
  ListPluginPoliciesEvents,
  PermissionEvents,
  RoleEvents,
  SEND_RESPONSE_STAGE,
} from '../audit-log/audit-logger';
import { auditError as logAuditError } from '../audit-log/rest-errors-interceptor';
import { ConditionalStorage } from '../database/conditional-storage';
import {
  daoToMetadata,
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { deepSortedEqual, isPermissionAction, policyToString } from '../helper';
import { validateRoleCondition } from '../validation/condition-validation';
import {
  validateEntityReference,
  validatePolicy,
  validateRole,
  validateSource,
} from '../validation/policies-validation';
import { EnforcerDelegate } from './enforcer-delegate';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';

export class PoliciesServer {
  constructor(
    private readonly permissions: PermissionsService,
    private readonly options: RouterOptions,
    private readonly enforcer: EnforcerDelegate,
    private readonly config: Config,
    private readonly httpAuth: HttpAuthService,
    private readonly auth: AuthService,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly pluginIdProvider: PluginIdProvider,
    private readonly roleMetadata: RoleMetadataStorage,
    private readonly aLog: AuditLogger,
  ) {}

  private async authorize(
    request: Request,
    identity: IdentityApi,
    permission: ResourcePermission,
  ): Promise<PolicyDecision> {
    if (permission !== policyEntityReadPermission) {
      const userIdentity = await identity.getIdentity({ request });
      if (!userIdentity) {
        throw new NotAllowedError('User identity not found');
      }
    }

    const decision = (
      await this.permissions.authorize(
        [{ permission: permission, resourceRef: permission.resourceType }],
        {
          credentials: await this.httpAuth.credentials(request),
        },
      )
    )[0];

    return decision;
  }

  async serve(): Promise<express.Router> {
    const router = await createRouter(this.options);

    const { identity, discovery, logger, config } = this.options;

    if (!identity) {
      throw new NotAllowedError(
        'Identity api not found, ensure the correct configuration for the RBAC plugin',
      );
    }

    const permissionsIntegrationRouter = createPermissionIntegrationRouter({
      resourceType: RESOURCE_TYPE_POLICY_ENTITY,
      permissions: policyEntityPermissions,
    });
    router.use(permissionsIntegrationRouter);

    const isPluginEnabled =
      this.config.getOptionalBoolean('permission.enabled');
    if (!isPluginEnabled) {
      return router;
    }

    const pluginPermMetaData = new PluginPermissionMetadataCollector(
      discovery,
      this.pluginIdProvider,
      logger,
      config,
    );

    router.get('/', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      response.send({ status: 'Authorized' });
    });

    // Policy CRUD

    router.get('/policies', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
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

      const body = await this.transformPolicyArray(...policies);

      await this.aLog.auditLog({
        message: `Return list permission policies`,
        eventName: PermissionEvents.GET_POLICY,
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200, body },
      });

      response.json(body);
    });

    router.get(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(
          request,
          identity,
          policyEntityReadPermission,
        );

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const entityRef = this.getEntityReference(request);

        const policy = await this.enforcer.getFilteredPolicy(0, entityRef);
        if (policy.length !== 0) {
          const body = await this.transformPolicyArray(...policy);

          await this.aLog.auditLog({
            message: `Return permission policy`,
            eventName: PermissionEvents.GET_POLICY,
            stage: SEND_RESPONSE_STAGE,
            status: 'succeeded',
            request,
            response: { status: 200, body },
          });

          response.json(body);
        } else {
          throw new NotFoundError(); // 404
        }
      },
    );

    router.delete(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(
          request,
          identity,
          policyEntityDeletePermission,
        );

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

        await this.enforcer.removePolicies(processedPolicies);

        await this.aLog.auditLog({
          message: `Deleted permission policies`,
          eventName: PermissionEvents.DELETE_POLICY,
          metadata: { policies: processedPolicies, source: 'rest' },
          stage: SEND_RESPONSE_STAGE,
          status: 'succeeded',
          request,
          response: { status: 204 },
        });

        response.status(204).end();
      },
    );

    router.post('/policies', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityCreatePermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const policyRaw: RoleBasedPolicy[] = request.body;

      if (isEmpty(policyRaw)) {
        throw new InputError(`permission policy must be present`); // 400
      }

      const processedPolicies = await this.processPolicies(policyRaw);

      const entityRef = processedPolicies[0][0];
      const roleMetadata = await this.roleMetadata.findRoleMetadata(entityRef);
      if (entityRef.startsWith('role:default') && !roleMetadata) {
        throw new Error(`Corresponding role ${entityRef} was not found`);
      }

      await this.enforcer.addPolicies(processedPolicies, 'rest');

      await this.aLog.auditLog({
        message: `Created permission policies`,
        eventName: PermissionEvents.CREATE_POLICY,
        metadata: { policies: processedPolicies, source: 'rest' },
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 201 },
      });

      response.status(201).end();
    });

    router.put(
      '/policies/:kind/:namespace/:name',
      async (request, response) => {
        const decision = await this.authorize(
          request,
          identity,
          policyEntityUpdatePermission,
        );

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

        const roleMetadata =
          await this.roleMetadata.findRoleMetadata(entityRef);
        if (entityRef.startsWith('role:default') && !roleMetadata) {
          throw new Error(`Corresponding role ${entityRef} was not found`);
        }

        await this.enforcer.updatePolicies(
          processedOldPolicy,
          processedNewPolicy,
          'rest',
        );

        await this.aLog.auditLog({
          message: `Updated permission policies`,
          eventName: PermissionEvents.UPDATE_POLICY,
          metadata: { policies: processedNewPolicy, source: 'rest' },
          stage: SEND_RESPONSE_STAGE,
          status: 'succeeded',
          request,
          response: { status: 200 },
        });

        response.status(200).end();
      },
    );

    // Role CRUD

    router.get('/roles', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const roles = await this.enforcer.getGroupingPolicy();

      const body = await this.transformRoleArray(...roles);

      await this.aLog.auditLog({
        message: `Return list roles`,
        eventName: RoleEvents.GET_ROLE,
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200, body },
      });

      response.json(body);
    });

    router.get('/roles/:kind/:namespace/:name', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      const roleEntityRef = this.getEntityReference(request, true);

      const role = await this.enforcer.getFilteredGroupingPolicy(
        1,
        roleEntityRef,
      );

      if (role.length !== 0) {
        const body = await this.transformRoleArray(...role);

        await this.aLog.auditLog({
          message: `Return ${body[0].name}`,
          eventName: RoleEvents.GET_ROLE,
          stage: SEND_RESPONSE_STAGE,
          status: 'succeeded',
          request,
          response: { status: 200, body },
        });

        response.json(body);
      } else {
        throw new NotFoundError(); // 404
      }
    });

    router.post('/roles', async (request, response) => {
      const uniqueItems = new Set<string>();
      const decision = await this.authorize(
        request,
        identity,
        policyEntityCreatePermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      const roleRaw: Role = request.body;
      let err = validateRole(roleRaw);
      if (err) {
        throw new InputError( // 400
          `Invalid role definition. Cause: ${err.message}`,
        );
      }

      const rMetadata = await this.roleMetadata.findRoleMetadata(roleRaw.name);

      err = await validateSource('rest', rMetadata);
      if (err) {
        throw new NotAllowedError(`Unable to add role: ${err.message}`);
      }

      const roles = this.transformRoleToArray(roleRaw);

      for (const role of roles) {
        if (
          (await this.enforcer.hasGroupingPolicy(...role)) &&
          !(await this.enforcer.hasFilteredPolicyMetadata(role, 'legacy'))
        ) {
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

      const user = await identity.getIdentity({ request });
      const modifiedBy = user?.identity.userEntityRef!;
      const metadata: RoleMetadataDao = {
        roleEntityRef: roleRaw.name,
        source: 'rest',
        description: roleRaw.metadata?.description ?? '',
        author: modifiedBy,
        modifiedBy,
      };

      await this.enforcer.addGroupingPolicies(roles, metadata);

      await this.aLog.auditLog({
        message: `Created ${metadata.roleEntityRef}`,
        eventName: RoleEvents.CREATE_ROLE,
        metadata: {
          ...metadata,
          members: roles.map(gp => gp[0]),
        },
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 201 },
      });

      response.status(201).end();
    });

    router.put('/roles/:kind/:namespace/:name', async (request, response) => {
      const uniqueItems = new Set<string>();
      const decision = await this.authorize(
        request,
        identity,
        policyEntityUpdatePermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }
      const roleEntityRef = this.getEntityReference(request, true);

      const oldRoleRaw: Role = request.body.oldRole;

      if (!oldRoleRaw) {
        throw new InputError(`'oldRole' object must be present`); // 400
      }
      const newRoleRaw: Role = request.body.newRole;
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
      // todo shell we allow newRole with an empty array?...

      const user = await identity.getIdentity({ request });
      const newMetadata: RoleMetadataDao = {
        ...newRoleRaw.metadata,
        source: newRoleRaw.metadata?.source ?? 'rest',
        roleEntityRef: newRoleRaw.name,
        modifiedBy: user?.identity.userEntityRef!,
      };

      const oldMetadata =
        await this.roleMetadata.findRoleMetadata(roleEntityRef);
      if (!oldMetadata) {
        throw new NotFoundError(`Unable to find metadata for ${roleEntityRef}`);
      }

      err = await validateSource('rest', oldMetadata);
      if (err) {
        throw new NotAllowedError(`Unable to edit role: ${err.message}`);
      }

      if (
        isEqual(oldRole, newRole) &&
        deepSortedEqual(oldMetadata, newMetadata, [
          'author',
          'modifiedBy',
          'createdAt',
          'lastModified',
        ])
      ) {
        // no content: old role and new role are equal and their metadata too
        response.status(204).end();
        return;
      }

      for (const role of newRole) {
        const hasRole = oldRole.some(element => {
          return isEqual(element, role);
        });
        // if the role is already part of old role and is a grouping policy we want to skip returning a conflict error
        // to allow for other roles to be checked and added
        if (await this.enforcer.hasGroupingPolicy(...role)) {
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
          throw new NotFoundError(
            `Member reference: ${role[0]} was not found for role ${roleEntityRef}`,
          ); // 404
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

      await this.enforcer.updateGroupingPolicies(oldRole, newRole, newMetadata);

      let message = `Updated ${oldMetadata.roleEntityRef}.`;
      if (newMetadata.roleEntityRef !== oldMetadata.roleEntityRef) {
        message = `${message}. Role entity reference renamed to ${newMetadata.roleEntityRef}`;
      }
      await this.aLog.auditLog({
        message,
        eventName: RoleEvents.UPDATE_ROLE,
        metadata: {
          ...newMetadata,
          members: newRole.map(gp => gp[0]),
        },
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200 },
      });

      response.status(200).end();
    });

    router.delete(
      '/roles/:kind/:namespace/:name',
      async (request, response) => {
        let roleMembers = [];
        const decision = await this.authorize(
          request,
          identity,
          policyEntityDeletePermission,
        );

        if (decision.result === AuthorizeResult.DENY) {
          throw new NotAllowedError(); // 403
        }

        const roleEntityRef = this.getEntityReference(request, true);

        if (request.query.memberReferences) {
          const memberReferences = this.getFirstQuery(
            request.query.memberReferences!,
          );
          roleMembers.push([memberReferences, roleEntityRef]);
        } else {
          roleMembers = await this.enforcer.getFilteredGroupingPolicy(
            1,
            roleEntityRef,
          );
        }

        for (const role of roleMembers) {
          if (!(await this.enforcer.hasGroupingPolicy(...role))) {
            throw new NotFoundError(); // 404
          }
        }

        const currentMetadata =
          await this.roleMetadata.findRoleMetadata(roleEntityRef);
        const err = await validateSource('rest', currentMetadata);
        if (err) {
          throw new NotAllowedError(`Unable to delete role: ${err.message}`);
        }

        const user = await identity.getIdentity({ request });
        const metadata: RoleMetadataDao = {
          roleEntityRef,
          source: 'rest',
          modifiedBy: user?.identity.userEntityRef!,
        };

        await this.enforcer.removeGroupingPolicies(
          roleMembers,
          metadata,
          false,
        );

        await this.aLog.auditLog({
          message: `Deleted ${metadata.roleEntityRef}`,
          eventName: RoleEvents.DELETE_ROLE,
          metadata: {
            ...metadata,
            members: roleMembers.map(gp => gp[0]),
          },
          stage: SEND_RESPONSE_STAGE,
          status: 'succeeded',
          request,
          response: { status: 204 },
        });

        response.status(204).end();
      },
    );

    router.get('/plugins/policies', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const body = await pluginPermMetaData.getPluginPolicies(this.auth);

      await this.aLog.auditLog({
        message: `Return list plugin policies`,
        eventName: ListPluginPoliciesEvents.GET_PLUGINS_POLICIES,
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200, body },
      });

      response.json(body);
    });

    router.get('/plugins/condition-rules', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const body = await pluginPermMetaData.getPluginConditionRules(this.auth);

      await this.aLog.auditLog({
        message: `Return list conditional rules and schemas`,
        eventName: ListConditionEvents.GET_CONDITION_RULES,
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200, body },
      });

      response.json(body);
    });

    router.get('/roles/conditions', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const conditions = await this.conditionalStorage.filterConditions(
        this.getFirstQuery(request.query.roleEntityRef),
        this.getFirstQuery(request.query.pluginId),
        this.getFirstQuery(request.query.resourceType),
        this.getActionQueries(request.query.actions),
      );

      const body: RoleConditionalPolicyDecision<PermissionAction>[] =
        conditions.map(condition => {
          return {
            ...condition,
            permissionMapping: condition.permissionMapping.map(pm => pm.action),
          };
        });

      await this.aLog.auditLog({
        message: `Return list conditional permission policies`,
        eventName: ConditionEvents.GET_CONDITION,
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200, body },
      });

      response.json(body);
    });

    router.post('/roles/conditions', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityCreatePermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const roleConditionPolicy: RoleConditionalPolicyDecision<PermissionAction> =
        request.body;
      validateRoleCondition(roleConditionPolicy);

      const conditionToCreate = await this.processConditionMapping(
        roleConditionPolicy,
        pluginPermMetaData,
      );

      const id =
        await this.conditionalStorage.createCondition(conditionToCreate);

      const body = { id: id };

      await this.aLog.auditLog({
        message: `Created conditional permission policy`,
        eventName: ConditionEvents.CREATE_CONDITION,
        metadata: { condition: conditionToCreate },
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 201, body },
      });

      response.status(201).json(body);
    });

    router.get('/roles/conditions/:id', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityReadPermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(request.params.id, 10);
      if (isNaN(id)) {
        throw new InputError('Id is not a valid number.');
      }

      const condition = await this.conditionalStorage.getCondition(id);
      if (!condition) {
        throw new NotFoundError();
      }

      const body: RoleConditionalPolicyDecision<PermissionAction> = {
        ...condition,
        permissionMapping: condition.permissionMapping.map(pm => pm.action),
      };

      await this.aLog.auditLog({
        message: `Return conditional permission policy by id`,
        eventName: ConditionEvents.GET_CONDITION,
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200, body },
      });

      response.json(body);
    });

    router.delete('/roles/conditions/:id', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityDeletePermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(request.params.id, 10);
      if (isNaN(id)) {
        throw new InputError('Id is not a valid number.');
      }

      const condition = await this.conditionalStorage.getCondition(id);
      if (!condition) {
        throw new NotFoundError(`Condition with id ${id} was not found`);
      }
      const conditionToDelete: RoleConditionalPolicyDecision<PermissionAction> =
        {
          ...condition,
          permissionMapping: condition.permissionMapping.map(pm => pm.action),
        };

      await this.conditionalStorage.deleteCondition(id);

      await this.aLog.auditLog({
        message: `Deleted conditional permission policy`,
        eventName: ConditionEvents.DELETE_CONDITION,
        metadata: { condition: conditionToDelete },
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 204 },
      });

      response.status(204).end();
    });

    router.put('/roles/conditions/:id', async (request, response) => {
      const decision = await this.authorize(
        request,
        identity,
        policyEntityUpdatePermission,
      );

      if (decision.result === AuthorizeResult.DENY) {
        throw new NotAllowedError(); // 403
      }

      const id: number = parseInt(request.params.id, 10);
      if (isNaN(id)) {
        throw new InputError('Id is not a valid number.');
      }

      const roleConditionPolicy: RoleConditionalPolicyDecision<PermissionAction> =
        request.body;

      validateRoleCondition(roleConditionPolicy);

      const conditionToUpdate = await this.processConditionMapping(
        roleConditionPolicy,
        pluginPermMetaData,
      );

      await this.conditionalStorage.updateCondition(id, conditionToUpdate);

      await this.aLog.auditLog({
        message: `Updated conditional permission policy`,
        eventName: ConditionEvents.UPDATE_CONDITION,
        metadata: { conditionId: id, condition: conditionToUpdate },
        stage: SEND_RESPONSE_STAGE,
        status: 'succeeded',
        request,
        response: { status: 200 },
      });

      response.status(200).end();
    });

    router.use(logAuditError(this.aLog));

    return router;
  }

  getEntityReference(request: Request, role?: boolean): string {
    const kind = request.params.kind;
    const namespace = request.params.namespace;
    const name = request.params.name;
    const entityRef = `${kind}:${namespace}/${name}`;

    const err = validateEntityReference(entityRef, role);
    if (err) {
      throw new InputError(err.message);
    }

    return entityRef;
  }

  async transformPolicyArray(
    ...policies: string[][]
  ): Promise<RoleBasedPolicy[]> {
    const roleBasedPolices: RoleBasedPolicy[] = [];
    for (const p of policies) {
      const [entityReference, permission, policy, effect] = p;
      const metadata = await this.enforcer.getMetadata(p);
      roleBasedPolices.push({
        entityReference,
        permission,
        policy,
        effect,
        metadata,
      });
    }

    return roleBasedPolices;
  }

  async transformRoleArray(...roles: string[][]): Promise<Role[]> {
    const combinedRoles: { [key: string]: string[] } = {};

    roles.forEach(([value, role]) => {
      if (combinedRoles.hasOwnProperty(role)) {
        combinedRoles[role].push(value);
      } else {
        combinedRoles[role] = [value];
      }
    });

    const result: Role[] = await Promise.all(
      Object.entries(combinedRoles).map(async ([role, value]) => {
        const metadataDao = await this.roleMetadata.findRoleMetadata(role);
        const metadata = metadataDao ? daoToMetadata(metadataDao) : undefined;
        return Promise.resolve({
          memberReferences: value,
          name: role,
          metadata,
        });
      }),
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

  getActionQueries(
    queryValue: string | string[] | ParsedQs | ParsedQs[] | undefined,
  ): PermissionAction[] | undefined {
    if (!queryValue) {
      return undefined;
    }
    if (Array.isArray(queryValue)) {
      const permissionNames: PermissionAction[] = [];
      for (const permissionQuery of queryValue) {
        if (
          typeof permissionQuery === 'string' &&
          isPermissionAction(permissionQuery)
        ) {
          permissionNames.push(permissionQuery);
        } else {
          throw new InputError(
            `Invalid permission action query value: ${permissionQuery}. Permission name should be string.`,
          );
        }
      }
      return permissionNames;
    }

    if (typeof queryValue === 'string' && isPermissionAction(queryValue)) {
      return [queryValue];
    }
    throw new InputError(
      `Invalid permission action query value: ${queryValue}. Permission name should be string.`,
    );
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
      let err = validatePolicy(policy);
      if (err) {
        throw new InputError(
          `Invalid ${errorMessage ?? 'policy'} definition. Cause: ${
            err.message
          }`,
        ); // 400
      }

      const metadata = await this.roleMetadata.findRoleMetadata(
        policy.entityReference!,
      );

      let action = errorMessage ? 'edit' : 'delete';
      action = isOld ? action : 'add';

      err = await validateSource('rest', metadata);
      if (err) {
        throw new NotAllowedError(
          `Unable to ${action} policy ${policy.entityReference},${policy.permission},${policy.policy},${policy.effect}: ${err.message}`,
        );
      }

      const transformedPolicy = this.transformPolicyToArray(policy);
      if (isOld && !(await this.enforcer.hasPolicy(...transformedPolicy))) {
        throw new NotFoundError(
          `Policy '${policyToString(transformedPolicy)}' not found`,
        ); // 404
      }

      if (
        !isOld &&
        (await this.enforcer.hasPolicy(...transformedPolicy)) &&
        !(await this.enforcer.hasFilteredPolicyMetadata(
          transformedPolicy,
          'legacy',
        ))
      ) {
        throw new ConflictError(
          `Policy '${policyToString(
            transformedPolicy,
          )}' has been already stored`,
        ); // 409
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

  async processConditionMapping(
    roleConditionPolicy: RoleConditionalPolicyDecision<PermissionAction>,
    pluginPermMetaData: PluginPermissionMetadataCollector,
  ): Promise<RoleConditionalPolicyDecision<PermissionInfo>> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: roleConditionPolicy.pluginId,
    });

    const rule: MetadataResponse | undefined =
      await pluginPermMetaData.getMetadataByPluginId(
        roleConditionPolicy.pluginId,
        token,
      );
    if (!rule?.permissions) {
      throw new Error(
        `Unable to get permission list for plugin ${roleConditionPolicy.pluginId}`,
      );
    }

    const permInfo: PermissionInfo[] = [];
    for (const action of roleConditionPolicy.permissionMapping) {
      const perm = rule.permissions.find(
        permission =>
          permission.type === 'resource' &&
          (action === permission.attributes.action ||
            (action === 'use' && permission.attributes.action === undefined)),
      );
      if (!perm) {
        throw new Error(
          `Unable to find permission to get permission name for resource type '${
            roleConditionPolicy.resourceType
          }' and action ${JSON.stringify(action)}`,
        );
      }
      permInfo.push({ name: perm.name, action });
    }

    return {
      ...roleConditionPolicy,
      permissionMapping: permInfo,
    };
  }
}
