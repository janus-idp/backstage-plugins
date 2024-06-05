import {
  getVoidLogger,
  PluginDatabaseManager,
} from '@backstage/backend-common';
import {
  mockServices,
  TestDatabaseId,
  TestDatabases,
} from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import * as Knex from 'knex';
import { createTracker, MockClient } from 'knex-mock-client';
import { Logger } from 'winston';

import {
  AuditLogOptions,
  DefaultAuditLogger,
} from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  CONDITIONAL_TABLE,
  ConditionalPolicyDecisionDAO,
  DataBaseConditionalStorage,
} from './conditional-storage';
import { migrate } from './migration';

jest.setTimeout(60000);

let loggerInfoSpy: jest.SpyInstance<Logger, [infoObject: object], any>;
let auditLoggerInfoSpy: jest.SpyInstance<
  Promise<void>,
  [options: AuditLogOptions],
  any
>;

describe('DataBaseConditionalStorage', () => {
  const databases = TestDatabases.create({
    ids: ['POSTGRES_13', 'SQLITE_3'],
  });

  const conditionDao1: ConditionalPolicyDecisionDAO = {
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    permissions: '[{"action":"read","name":"catalog.entity.read"}]',
    roleEntityRef: 'role:default/test',
    result: AuthorizeResult.CONDITIONAL,
    conditionsJson:
      `{` +
      `"rule":"IS_ENTITY_OWNER",` +
      `"resourceType":"catalog-entity",` +
      `"params":{"claims":["group:default/test-group"]}` +
      `}`,
  };
  const conditionDao2: ConditionalPolicyDecisionDAO = {
    pluginId: 'test',
    resourceType: 'test-entity',
    permissions: '[{"action": "delete", "name": "catalog.entity.delete"}]',
    roleEntityRef: 'role:default/test-2',
    result: AuthorizeResult.CONDITIONAL,
    conditionsJson:
      `{` +
      `"rule": "IS_ENTITY_OWNER",` +
      `"resourceType": "test-entity",` +
      `"params": {"claims": ["group:default/test-group"]}` +
      `}`,
  };
  const condition1: RoleConditionalPolicyDecision<PermissionInfo> = {
    id: 1,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    permissionMapping: [{ action: 'read', name: 'catalog.entity.read' }],
    roleEntityRef: 'role:default/test',
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {
        claims: ['group:default/test-group'],
      },
    },
  };
  const condition2: RoleConditionalPolicyDecision<PermissionInfo> = {
    id: 2,
    pluginId: 'test',
    resourceType: 'test-entity',
    permissionMapping: [{ action: 'delete', name: 'catalog.entity.delete' }],
    roleEntityRef: 'role:default/test-2',
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'test-entity',
      params: {
        claims: ['group:default/test-group'],
      },
    },
  };
  const logger = getVoidLogger();

  const mockHttpAuth = mockServices.httpAuth();
  const mockAuth = mockServices.auth();

  const aLog = new DefaultAuditLogger({
    authService: mockAuth,
    httpAuthService: mockHttpAuth,
    logger,
  });
  loggerInfoSpy = jest.spyOn(logger, 'info');
  auditLoggerInfoSpy = jest.spyOn(aLog, 'auditLog');

  beforeEach(() => {
    loggerInfoSpy.mockClear();
    auditLoggerInfoSpy.mockClear();
  });

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const databaseManagerMock: PluginDatabaseManager = {
      getClient: jest.fn(() => {
        return Promise.resolve(knex);
      }),
      migrations: { skip: false },
    };

    await migrate(databaseManagerMock);
    return {
      knex,
      db: new DataBaseConditionalStorage(knex, aLog),
    };
  }

  describe('filterConditions', () => {
    it.each(databases.eachSupportedId())(
      'should return all conditions',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions();
        expect(conditions.length).toEqual(2);

        expect(conditions[0]).toEqual(condition1);
        expect(conditions[1]).toEqual(condition2);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by roleEntityRef',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(`role:default/test`);
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by pluginId',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(undefined, 'catalog');
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by pluginId',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          undefined,
          undefined,
          'catalog-entity',
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by action',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          undefined,
          undefined,
          undefined,
          ['read'],
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by permission name',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          undefined,
          undefined,
          undefined,
          undefined,
          ['catalog.entity.read'],
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by all arguments',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          'role:default/test',
          'catalog',
          'catalog-entity',
          ['read'],
          ['catalog.entity.read'],
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );
  });

  describe('createCondition', () => {
    it.each(databases.eachSupportedId())(
      'should successfully create new policy metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        const modifiedBy = `user:default/tom`;
        const id = await db.createCondition(condition1, modifiedBy);

        const condition = await knex<ConditionalPolicyDecisionDAO>(
          CONDITIONAL_TABLE,
        ).where('id', id);
        expect(condition.length).toEqual(1);
        expect(condition[0]).toEqual({
          id: 1,
          ...conditionDao1,
        });
        const logOpts = auditLoggerInfoSpy.mock.calls[0][0] as AuditLogOptions;
        expect(logOpts).toEqual({
          actorId: modifiedBy,
          eventName: 'CreateCondition',
          message: `Created condition for role '${condition1.roleEntityRef}'`,
          metadata: {
            condition: condition1,
            roleEntityRef: condition1.roleEntityRef,
            source: 'rest',
          },
          stage: 'handleRBACData',
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should throw conflict error',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const modifiedBy = `user:default/tom`;
        await expect(async () => {
          await db.createCondition(condition1, modifiedBy);
        }).rejects.toThrow(
          `A condition with resource type 'catalog-entity'` +
            ` and permission '[{"action":"read","name":"catalog.entity.read"}]'` +
            ` has already been stored for role 'role:default/test'`,
        );
      },
    );

    it('should throw failed to create metadata error, because inserted result is undefined', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(CONDITIONAL_TABLE).response(undefined);
      tracker.on.insert(CONDITIONAL_TABLE).response(undefined);

      const db = new DataBaseConditionalStorage(knex, aLog);

      const modifiedBy = `user:default/tom`;
      await expect(async () => {
        await db.createCondition(condition1, modifiedBy);
      }).rejects.toThrow(`Failed to create the condition.`);
    });
  });

  describe('findUniqueCondition', () => {
    it.each(databases.eachSupportedId())(
      'should find condition',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const condition = await db.findUniqueCondition(
          'role:default/test',
          'catalog-entity',
          ['catalog.entity.read'],
        );

        expect(condition).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should not find condition',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const condition = await db.findUniqueCondition(
          'role:default/test',
          'catalog-entity',
          ['read'],
        );

        expect(condition).toBeUndefined();
      },
    );
  });

  describe('getCondition', () => {
    it.each(databases.eachSupportedId())(
      'should return condition by id',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const condition = await db.getCondition(1);

        expect(condition).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should not find condition',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const condition = await db.getCondition(1);

        expect(condition).toBeUndefined();
      },
    );
  });

  describe('deleteCondition', () => {
    it.each(databases.eachSupportedId())(
      'should delete condition by id',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const modifiedBy = `user:default/tom`;
        await db.deleteCondition(1, modifiedBy);

        const conditions = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>();
        expect(conditions.length).toEqual(0);

        const loggedOpts = auditLoggerInfoSpy.mock
          .calls[0][0] as AuditLogOptions;
        expect(loggedOpts).toEqual({
          actorId: modifiedBy,
          eventName: 'DeleteCondition',
          message: `Deleted condition for role '${condition1.roleEntityRef}'`,
          metadata: {
            condition: condition1,
            roleEntityRef: condition1.roleEntityRef,
            source: 'rest',
          },
          stage: 'handleRBACData',
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should not find condition',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const modifiedBy = `user:default/tom`;
        await expect(async () => {
          await db.deleteCondition(1, modifiedBy);
        }).rejects.toThrow('Condition with id 1 was not found');
      },
    );
  });

  describe('updateCondition', () => {
    it.each(databases.eachSupportedId())(
      'should update condition',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.read', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        const modifiedBy = `user:default/tom`;
        await db.updateCondition(1, updateCondition, modifiedBy);

        const condition = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>()
          .where('id', 1);
        expect(condition).toEqual([
          {
            ...conditionDao1,
            permissions:
              '[{"name":"catalog.entity.read","action":"read"},{"name":"catalog.entity.delete","action":"delete"}]',
            id: 1,
          },
        ]);
        const logOpts = auditLoggerInfoSpy.mock.calls[0][0] as AuditLogOptions;
        expect(logOpts).toEqual({
          actorId: modifiedBy,
          eventName: 'UpdateCondition',
          message: `Updated condition for role '${condition1.roleEntityRef}'`,
          metadata: {
            condition: updateCondition,
            roleEntityRef: condition1.roleEntityRef,
            source: 'rest',
          },
          stage: 'handleRBACData',
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update condition, because condition not found',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.name', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        await expect(async () => {
          const modifiedBy = `user:default/tom`;
          await db.updateCondition(1, updateCondition, modifiedBy);
        }).rejects.toThrow('Condition with id 1 was not found');
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update condition, because found condition with conflict',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions:
            '[{"name": "catalog.entity.delete", "action": "delete"}]',
        });

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.read', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        await expect(async () => {
          const modifiedBy = `user:default/tom`;
          await db.updateCondition(1, updateCondition, modifiedBy);
        }).rejects.toThrow(
          `Found condition with conflicted permission '{"name":"catalog.entity.delete","action":"delete"}'. Role could have multiple ` +
            `conditions for the same resource type 'catalog-entity', but with different permission name and action sets.`,
        );
      },
    );
  });
});
