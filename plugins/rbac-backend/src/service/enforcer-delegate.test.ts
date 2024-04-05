import { getVoidLogger } from '@backstage/backend-common';
import { DatabaseService } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';

import { newEnforcer, newModelFromString } from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../database/policy-metadata-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { CSV_PERMISSION_POLICY_FILE_AUTHOR } from '../file-permissions/csv';
import { policyToString } from '../helper';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';

const catalogApi = {
  getEntityAncestors: jest.fn().mockImplementation(),
  getLocationById: jest.fn().mockImplementation(),
  getEntities: jest.fn().mockImplementation(),
  getEntitiesByRefs: jest.fn().mockImplementation(),
  queryEntities: jest.fn().mockImplementation(),
  getEntityByRef: jest.fn().mockImplementation(),
  refreshEntity: jest.fn().mockImplementation(),
  getEntityFacets: jest.fn().mockImplementation(),
  addLocation: jest.fn().mockImplementation(),
  getLocationByRef: jest.fn().mockImplementation(),
  removeLocationById: jest.fn().mockImplementation(),
  removeEntityByUid: jest.fn().mockImplementation(),
  validateEntity: jest.fn().mockImplementation(),
  getLocationByEntity: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const policyMetadataStorageMock: PolicyMetadataStorage = {
  findPolicyMetadataBySource: jest
    .fn()
    .mockImplementation(
      async (_source: Source): Promise<PermissionPolicyMetadataDao[]> => {
        return [];
      },
    ),
  findPolicyMetadata: jest.fn().mockImplementation(),
  createPolicyMetadata: jest.fn().mockImplementation(),
  removePolicyMetadata: jest.fn().mockImplementation(),
};

const tokenManagerMock = {
  getToken: jest.fn().mockImplementation(async () => {
    return Promise.resolve({ token: 'some-token' });
  }),
  authenticate: jest.fn().mockImplementation(),
};

const dbManagerMock: DatabaseService = {
  getClient: jest.fn().mockImplementation(),
};

const config = new ConfigReader({
  backend: {
    database: {
      client: 'better-sqlite3',
      connection: ':memory:',
    },
  },
  permission: {
    rbac: {},
  },
});
const policy = ['user:default/tom', 'policy-entity', 'read', 'allow'];
const secondPolicy = ['user:default/tim', 'catalog-entity', 'write', 'allow'];

const groupingPolicy = ['user:default/tom', 'role:default/dev-team'];
const secondGroupingPolicy = ['user:default/tim', 'role:default/qa-team'];

describe('EnforcerDelegate', () => {
  let enfRemovePolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemovePoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [rules: string[][]],
    any
  >;
  let enfRemoveGroupingPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    string[],
    any
  >;
  let enfFilterGroupingPolicySpy: jest.SpyInstance<
    Promise<string[][]>,
    [number, ...fieldValues: string[]],
    any
  >;
  let enfRemoveGroupingPoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [rules: string[][]],
    any
  >;
  let enfAddPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    [...policy: string[]],
    any
  >;
  let enfAddGroupingPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    [...policy: string[]],
    any
  >;
  let enfUpdateGroupingPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    [...policy: string[]],
    any
  >;
  let enfAddPoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [rules: string[][]],
    any
  >;

  beforeEach(() => {
    (policyMetadataStorageMock.createPolicyMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.createRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.updateRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.removeRoleMetadata as jest.Mock).mockReset();
    (policyMetadataStorageMock.removePolicyMetadata as jest.Mock).mockReset();
    (policyMetadataStorageMock.findPolicyMetadata as jest.Mock).mockReset();
  });

  async function createEnfDelegate(
    policies?: string[][],
    groupingPolicies?: string[][],
  ): Promise<EnforcerDelegate> {
    const theModel = newModelFromString(MODEL);
    const logger = getVoidLogger();

    const sqliteInMemoryAdapter = await new CasbinDBAdapterFactory(
      config,
      dbManagerMock,
    ).createAdapter();

    const catalogDBClient = Knex.knex({ client: MockClient });
    const enf = await newEnforcer(theModel, sqliteInMemoryAdapter);
    enfRemovePolicySpy = jest.spyOn(enf, 'removePolicy');
    enfRemovePoliciesSpy = jest.spyOn(enf, 'removePolicies');
    enfRemoveGroupingPolicySpy = jest.spyOn(enf, 'removeGroupingPolicy');
    enfFilterGroupingPolicySpy = jest.spyOn(enf, 'getFilteredGroupingPolicy');
    enfRemoveGroupingPoliciesSpy = jest.spyOn(enf, 'removeGroupingPolicies');
    enfAddPolicySpy = jest.spyOn(enf, 'addPolicy');
    enfAddGroupingPolicySpy = jest.spyOn(enf, 'addGroupingPolicy');
    enfUpdateGroupingPolicySpy = jest.spyOn(enf, 'addGroupingPolicy');
    enfAddPoliciesSpy = jest.spyOn(enf, 'addPolicies');

    const rm = new BackstageRoleManager(
      catalogApi,
      logger,
      tokenManagerMock,
      catalogDBClient,
    );
    enf.setRoleManager(rm);
    enf.enableAutoBuildRoleLinks(false);
    await enf.buildRoleLinks();

    if (policies && policies.length > 0) {
      await enf.addPolicies(policies);
    }
    if (groupingPolicies && groupingPolicies.length > 0) {
      await enf.addGroupingPolicies(groupingPolicies);
    }

    const knex = Knex.knex({ client: MockClient });

    return new EnforcerDelegate(
      enf,
      policyMetadataStorageMock,
      roleMetadataStorageMock,
      knex,
    );
  }

  describe('hasPolicy', () => {
    it('has policy should return false', async () => {
      const enfDelegate = await createEnfDelegate();
      const result = await enfDelegate.hasPolicy(...policy);

      expect(result).toBeFalsy();
    });

    it('has policy should return true', async () => {
      const enfDelegate = await createEnfDelegate([policy]);

      const result = await enfDelegate.hasPolicy(...policy);

      expect(result).toBeTruthy();
    });
  });

  describe('hasGroupingPolicy', () => {
    it('has policy should return false', async () => {
      const enfDelegate = await createEnfDelegate([policy]);
      const result = await enfDelegate.hasGroupingPolicy(...groupingPolicy);

      expect(result).toBeFalsy();
    });

    it('has policy should return true', async () => {
      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const result = await enfDelegate.hasGroupingPolicy(...groupingPolicy);

      expect(result).toBeTruthy();
    });
  });

  describe('getPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      const policies = await enfDelegate.getPolicy();

      expect(policies.length).toEqual(0);
    });

    it('should return policy', async () => {
      const enfDelegate = await createEnfDelegate([policy]);

      const policies = await enfDelegate.getPolicy();

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(policy);
    });
  });

  describe('getGroupingPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      const groupingPolicies = await enfDelegate.getGroupingPolicy();

      expect(groupingPolicies.length).toEqual(0);
    });

    it('should return grouping policy', async () => {
      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const policies = await enfDelegate.getGroupingPolicy();

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(groupingPolicy);
    });
  });

  describe('getFilteredPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredPolicy(0, policy[0]);

      expect(policies.length).toEqual(0);
    });

    it('should return filteredPolicy', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);

      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredPolicy(
        0,
        'user:default/tim',
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(secondPolicy);
    });
  });

  describe('getFilteredGroupingPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredGroupingPolicy(
        0,
        'user:default/tim',
      );

      expect(policies.length).toEqual(0);
    });

    it('should return filteredPolicy', async () => {
      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredGroupingPolicy(
        0,
        'user:default/tim',
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(secondGroupingPolicy);
    });
  });

  describe('addPolicy', () => {
    it('should add policy', async () => {
      const enfDelegate = await createEnfDelegate();
      enfAddPolicySpy.mockClear();

      await enfDelegate.addPolicy(policy, 'rest');

      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', policy, expect.anything());
      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policy);
    });

    it('should fail to add policy, caused policy metadata storage error', async () => {
      const enfDelegate = await createEnfDelegate();

      policyMetadataStorageMock.createPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      await expect(enfDelegate.addPolicy(policy, 'rest')).rejects.toThrow(
        'some unexpected error',
      );
    });
  });

  describe('addPolicies', () => {
    it('should be added single policy', async () => {
      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addPolicies([policy], 'rest');

      const storePolicies = await enfDelegate.getPolicy();

      expect(storePolicies).toEqual([policy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenNthCalledWith(1, 'rest', policy, expect.anything());
    });

    it('should be added few policies', async () => {
      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addPolicies([policy, secondPolicy], 'rest');

      const storePolicies = await enfDelegate.getPolicy();

      expect(storePolicies.length).toEqual(2);
      expect(storePolicies).toEqual(
        expect.arrayContaining([
          expect.objectContaining(policy),
          expect.objectContaining(secondPolicy),
        ]),
      );
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', policy, expect.anything());
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', secondPolicy, expect.anything());
    });

    it('should fail to add policy, because policy metadata storage fails', async () => {
      const enfDelegate = await createEnfDelegate();

      policyMetadataStorageMock.createPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      await expect(
        enfDelegate.addPolicies([policy, secondPolicy], 'rest'),
      ).rejects.toThrow('some unexpected error');
    });

    it('should not fail, when argument is empty array', async () => {
      const enfDelegate = await createEnfDelegate();

      enfDelegate.addPolicies([], 'rest');

      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).not.toHaveBeenCalled();
      expect((await enfDelegate.getPolicy()).length).toEqual(0);
    });
  });

  describe('addGroupingPolicy', () => {
    it('should add grouping policy and create role metadata', async () => {
      (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReturnValue(
        Promise.resolve(undefined),
      );
      enfUpdateGroupingPolicySpy.mockClear();

      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef: 'role:default/dev-team',
      });

      expect(enfUpdateGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicy,
      );
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalled();
      expect(
        (roleMetadataStorageMock.createRoleMetadata as jest.Mock).mock.calls
          .length,
      ).toEqual(1);
      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];
      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);

      expect(metadata.source).toEqual('rest');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
    });

    it('should fail to add policy, caused policy metadata storage error', async () => {
      const enfDelegate = await createEnfDelegate();

      policyMetadataStorageMock.createPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      await expect(
        enfDelegate.addGroupingPolicy(groupingPolicy, {
          source: 'rest',
          roleEntityRef: 'role:default/dev-team',
        }),
      ).rejects.toThrow('some unexpected error');
    });

    it('should fail to add policy, caused role metadata storage error', async () => {
      const enfDelegate = await createEnfDelegate();

      roleMetadataStorageMock.createRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      await expect(
        enfDelegate.addGroupingPolicy(groupingPolicy, {
          source: 'rest',
          roleEntityRef: 'role:default/dev-team',
        }),
      ).rejects.toThrow('some unexpected error');
    });

    it('should update role metadata, because metadata has been created', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return {
              source: 'csv-file',
              roleEntityRef: 'role:default/dev-team',
              createdAt: '2024-03-01 00:23:41+00',
            };
          },
        );

      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef: 'role:default/dev-team',
      });

      expect(enfUpdateGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicy,
      );
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.updateRoleMetadata as jest.Mock
      ).mock.calls[0][0];
      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.source).toEqual('rest');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
    });
  });

  describe('addGroupingPolicies', () => {
    it('should add grouping policies and create role metadata', async () => {
      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
        author: 'user:default/some-user',
      };
      await enfDelegate.addGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies).toEqual([groupingPolicy, secondGroupingPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', secondGroupingPolicy, expect.anything());

      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        expect.anything(),
      );

      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.roleEntityRef).toEqual('role:default/security');
      expect(metadata.source).toEqual('rest');
      expect(metadata.description).toBeUndefined();
    });

    it('should add grouping policies and create role metadata with description', async () => {
      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
        description: 'Role for security engineers',
      };
      await enfDelegate.addGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies).toEqual([groupingPolicy, secondGroupingPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', secondGroupingPolicy, expect.anything());

      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        expect.anything(),
      );

      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);
      expect(metadata.roleEntityRef).toEqual('role:default/security');
      expect(metadata.source).toEqual('rest');
      expect(metadata.description).toEqual('Role for security engineers');
    });

    it('should fail to add grouping policy, because fail to create role metadata', async () => {
      roleMetadataStorageMock.createRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
      };
      await expect(
        enfDelegate.addGroupingPolicies(
          [groupingPolicy, secondGroupingPolicy],
          roleMetadataDao,
        ),
      ).rejects.toThrow('some unexpected error');

      // shouldn't store group policies
      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies).toEqual([]);
    });

    it('should update role metadata, because metadata has been created', async () => {
      (roleMetadataStorageMock.findRoleMetadata as jest.Mock) = jest
        .fn()
        .mockReturnValueOnce({
          source: 'csv-file',
          roleEntityRef: 'role:default/dev-team',
          author: 'user:default/some-user',
          description: 'Role for dev engineers',
          createdAt: '2024-03-01 00:23:41+00',
        });

      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        modifiedBy: 'user:default/system-admin',
      };
      await enfDelegate.addGroupingPolicies(
        [
          ['user:default/tom', 'role:default/dev-team'],
          ['user:default/tim', 'role:default/dev-team'],
        ],
        roleMetadataDao,
      );
      const storedPolicies = await enfDelegate.getGroupingPolicy();

      expect(storedPolicies).toEqual([
        ['user:default/tom', 'role:default/dev-team'],
        ['user:default/tim', 'role:default/dev-team'],
      ]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith(
        'rest',
        ['user:default/tom', 'role:default/dev-team'],
        expect.anything(),
      );
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith(
        'rest',
        ['user:default/tim', 'role:default/dev-team'],
        expect.anything(),
      );

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });
  });

  describe('updateGroupingPolicies', () => {
    it('should update grouping policies: add one more policy and update roleMetadata with new modifiedBy', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/dev-team',
            author: 'user:default/tom',
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        modifiedBy: 'user:default/system-admin',
      };

      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy],
        [groupingPolicy, secondGroupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(2);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', secondGroupingPolicy, expect.anything());

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/tom');
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });

    it('should update grouping policies: one policy should be removed', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/dev-team',
            author: 'user:default/some-user',
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });

      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        modifiedBy: 'user:default/system-admin',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        [groupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(1);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });

    it('should update grouping policies: role should be renamed', async () => {
      const oldRoleName = 'role:default/dev-team';
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: oldRoleName,
            author: 'user:default/some-user',
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });

      const newRoleName = 'role:default/new-team-name';
      const groupingPolicyWithRenamedRole = [groupingPolicy[0], newRoleName];
      const secondGroupingPolicyWithRenamedRole = [
        secondGroupingPolicy[1],
        newRoleName,
      ];

      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: newRoleName,
        source: 'rest',
        modifiedBy: 'user:default/system-admin',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        [groupingPolicyWithRenamedRole, secondGroupingPolicyWithRenamedRole],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(2);
      expect(storedPolicies[0]).toEqual(groupingPolicyWithRenamedRole);
      expect(storedPolicies[1]).toEqual(secondGroupingPolicyWithRenamedRole);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith(
        'rest',
        groupingPolicyWithRenamedRole,
        expect.anything(),
      );
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith(
        'rest',
        secondGroupingPolicyWithRenamedRole,
        expect.anything(),
      );

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual(newRoleName);
      expect(metadata.source).toEqual('rest');
    });

    it('should update grouping policies: should be updated role description and source', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'legacy',
            roleEntityRef: 'role:default/dev-team',
            author: 'user:default/some-user',
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        modifiedBy: 'user:default/system-admin',
        description: 'some-new-description',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy],
        [groupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(1);
      expect(storedPolicies).toEqual([groupingPolicy]);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.description).toEqual('some-new-description');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });
  });

  describe('updatePolicies', () => {
    it('should be updated single policy', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });
      const enfDelegate = await createEnfDelegate([policy]);
      enfAddPolicySpy.mockClear();
      enfRemovePoliciesSpy.mockClear();

      const newPolicy = ['user:default/tom', 'policy-entity', 'read', 'deny'];

      await enfDelegate.updatePolicies([policy], [newPolicy], 'rest');

      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, policy, expect.anything());
      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith([policy]);
      expect(enfAddPoliciesSpy).toHaveBeenCalledWith([newPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenNthCalledWith(1, 'rest', newPolicy, expect.anything());
    });

    it('should be added few policies', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);
      enfAddPolicySpy.mockClear();
      enfRemovePoliciesSpy.mockClear();

      const newPolicy1 = ['user:default/tom', 'policy-entity', 'read', 'deny'];
      const newPolicy2 = [
        'user:default/tim',
        'catalog-entity',
        'write',
        'allow',
      ];

      await enfDelegate.updatePolicies(
        [policy, secondPolicy],
        [newPolicy1, newPolicy2],
        'rest',
      );

      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, policy, expect.anything());
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(2, secondPolicy, expect.anything());
      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith([policy, secondPolicy]);
      expect(enfAddPoliciesSpy).toHaveBeenCalledWith([newPolicy1, newPolicy2]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenNthCalledWith(1, 'rest', newPolicy1, expect.anything());
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenNthCalledWith(2, 'rest', newPolicy2, expect.anything());
    });
  });

  describe('removePolicy', () => {
    const policyToDelete = [
      'user:default/some-user',
      'catalog-entity',
      'read',
      'allow',
    ];

    it('policy should be removed', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });

      const enfDelegate = await createEnfDelegate([policyToDelete]);
      await enfDelegate.removePolicy(policyToDelete, 'rest', false);

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(policyToDelete, expect.anything());
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...policyToDelete);
    });

    it('policy should fail to remove, because not found error', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation();

      const enfDelegate = await createEnfDelegate([policyToDelete]);
      await expect(
        enfDelegate.removePolicy(policyToDelete, 'rest', false),
      ).rejects.toThrow(
        `A metadata for policy '${policyToString(
          policyToDelete,
        )}' was not found`,
      );
    });

    it('should fail to remove policy with source "configuration"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'configuration',
          };
        });

      const enfDelegate = await createEnfDelegate([policyToDelete]);
      await expect(
        enfDelegate.removePolicy(policyToDelete, 'rest', false),
      ).rejects.toThrow(
        `Error: Attempted to modify an immutable pre-defined policy '${policyToString(
          policyToDelete,
        )}'. This policy cannot be altered directly. If you need to make changes, consider removing the associated RBAC admin '${
          policyToDelete[0]
        }' using the application configuration.`,
      );
    });

    it('should fail to remove policy with source "csv-file"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate([policyToDelete]);
      await expect(
        enfDelegate.removePolicy(policyToDelete, 'rest', false),
      ).rejects.toThrow(
        `policy '${policyToString(
          policyToDelete,
        )}' can be modified or deleted only with help of 'policies-csv-file'`,
      );
    });

    it('should be removed even with source "csv-file", when corresponding flag is enabled', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate([policyToDelete]);
      await enfDelegate.removePolicy(policyToDelete, 'rest', true);

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(policyToDelete, expect.anything());
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...policyToDelete);
    });
  });

  describe('removePolicies', () => {
    const policiesToDelete = [
      ['user:default/some-user', 'catalog-entity', 'read', 'allow'],
      ['user:default/some-user-2', 'catalog-entity', 'read', 'allow'],
    ];
    it('policies should be removed', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });

      const enfDelegate = await createEnfDelegate(policiesToDelete);
      await enfDelegate.removePolicies(policiesToDelete, 'rest', false);

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, policiesToDelete[0], expect.anything());
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(2, policiesToDelete[1], expect.anything());
      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith(policiesToDelete);
    });

    it('should fail to remove, because not found error', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation();

      const enfDelegate = await createEnfDelegate(policiesToDelete);
      await expect(
        enfDelegate.removePolicies(policiesToDelete, 'rest', false),
      ).rejects.toThrow(
        `A metadata for policy '${policyToString(
          policiesToDelete[0],
        )}' was not found`,
      );
    });

    it('should fail to remove policy with source "configuration"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'configuration',
          };
        });

      const enfDelegate = await createEnfDelegate(policiesToDelete);
      await expect(
        enfDelegate.removePolicies(policiesToDelete, 'rest', false),
      ).rejects.toThrow(
        `Error: Attempted to modify an immutable pre-defined policy '${policyToString(
          policiesToDelete[0],
        )}'. This policy cannot be altered directly. If you need to make changes, consider removing the associated RBAC admin '${
          policiesToDelete[0][0]
        }' using the application configuration.`,
      );
    });

    it('should fail to remove policy with source "csv-file"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate(policiesToDelete);
      await expect(
        enfDelegate.removePolicies(policiesToDelete, 'rest', false),
      ).rejects.toThrow(
        `policy '${policyToString(
          policiesToDelete[0],
        )}' can be modified or deleted only with help of 'policies-csv-file'`,
      );
    });

    it('should be removed even with source "csv-file", when corresponding flag is enabled', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate(policiesToDelete);
      await enfDelegate.removePolicies(policiesToDelete, 'rest', true);

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(policiesToDelete[0], expect.anything());
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(policiesToDelete[1], expect.anything());
      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith(policiesToDelete);
    });
  });

  describe('removeGroupingPolicy', () => {
    const groupingPolicyToDelete = [
      'user:default/some-user',
      'role:default/team-dev',
    ];

    it('should remove grouping policy and remove role metadata', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
          };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        { source: 'rest', roleEntityRef: 'role:default/team-dev' },
        false,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, groupingPolicyToDelete, expect.anything());
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicyToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(enfFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/team-dev',
        expect.anything(),
      );
    });

    it('should remove grouping policy and update role metadata', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      enfFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate(
        [],
        [
          groupingPolicyToDelete,
          ['group:default/team-a', 'role:default/team-dev'],
        ],
      );
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        { source: 'rest', roleEntityRef: 'role:default/team-dev' },
        false,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, groupingPolicyToDelete, expect.anything());
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicyToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(enfFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.roleEntityRef).toEqual('role:default/team-dev');
      expect(metadata.source).toEqual('rest');
    });

    it('should remove grouping policy and not update or remove role metadata, because isUpdate flag set to true', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
          };
        });
      enfFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        { source: 'rest', roleEntityRef: 'role:default/team-dev' },
        true,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, groupingPolicyToDelete, expect.anything());
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicyToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).not.toHaveBeenCalled();
      expect(enfFilterGroupingPolicySpy).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.removeRoleMetadata).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.updateRoleMetadata).not.toHaveBeenCalled();
    });

    it('should fail to remove grouping policy, because not found error', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation();

      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await expect(
        enfDelegate.removeGroupingPolicy(
          groupingPolicyToDelete,
          { source: 'rest', roleEntityRef: 'role:default/team-dev' },
          false,
        ),
      ).rejects.toThrow(
        `A metadata for policy '${policyToString(
          groupingPolicyToDelete,
        )}' was not found`,
      );
    });

    it('should fail to remove grouping policy with source "configuration"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'configuration',
          };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await expect(
        enfDelegate.removeGroupingPolicy(
          groupingPolicyToDelete,
          { source: 'rest', roleEntityRef: 'role:default/team-dev' },
          false,
        ),
      ).rejects.toThrow(
        `Error: Attempted to modify an immutable pre-defined policy '${policyToString(
          groupingPolicyToDelete,
        )}'. This policy cannot be altered directly. If you need to make changes, consider removing the associated RBAC admin '${
          groupingPolicyToDelete[0]
        }' using the application configuration.`,
      );
    });

    it('should fail to remove grouping policy with source "csv-file"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await expect(
        enfDelegate.removeGroupingPolicy(
          groupingPolicyToDelete,
          { source: 'rest', roleEntityRef: 'role:default/team-dev' },
          false,
        ),
      ).rejects.toThrow(
        `policy '${policyToString(
          groupingPolicyToDelete,
        )}' can be modified or deleted only with help of 'policies-csv-file'`,
      );
    });

    it('should be removed grouping policy even with source "csv-file", when corresponding flag is enabled', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        { source: 'rest', roleEntityRef: 'role:default/team-dev' },
        false,
        true,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(groupingPolicyToDelete, expect.anything());
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicyToDelete,
      );
    });
  });

  describe('removeGroupingPolicies', () => {
    const groupingPoliciesToDelete = [
      ['user:default/some-user', 'role:default/team-dev'],
      ['group:default/team-a', 'role:default/team-dev'],
    ];

    it('should remove grouping policies and remove role metadata', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      enfFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        'rest',
        'user:default/test-user',
        false,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(
        1,
        groupingPoliciesToDelete[0],
        expect.anything(),
      );
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(
        2,
        groupingPoliciesToDelete[1],
        expect.anything(),
      );
      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(enfFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/team-dev',
        expect.anything(),
      );
    });

    it('should remove grouping policy and update role metadata', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      enfFilterGroupingPolicySpy.mockReset();

      const remainingGroupPolicy = [
        'user:default/some-user-2',
        'role:default/team-dev',
      ];
      const enfDelegate = await createEnfDelegate(
        [],
        [...groupingPoliciesToDelete, remainingGroupPolicy],
      );
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        'rest',
        'user:default/test-user',
        false,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(
        1,
        groupingPoliciesToDelete[0],
        expect.anything(),
      );
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(
        2,
        groupingPoliciesToDelete[1],
        expect.anything(),
      );
      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(enfFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.roleEntityRef).toEqual('role:default/team-dev');
      expect(metadata.source).toEqual('rest');
    });

    it('should remove grouping policy and not update or remove role metadata, because isUpdate flag set to true', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
          };
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      enfFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        'rest',
        'user:default/test-user',
        true,
        true,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(
        1,
        groupingPoliciesToDelete[0],
        expect.anything(),
      );
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(
        2,
        groupingPoliciesToDelete[1],
        expect.anything(),
      );
      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).not.toHaveBeenCalled();
      expect(enfFilterGroupingPolicySpy).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.removeRoleMetadata).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.updateRoleMetadata).not.toHaveBeenCalled();
    });

    it('should fail to remove grouping policy, because not found error', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation();

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await expect(
        enfDelegate.removeGroupingPolicies(
          groupingPoliciesToDelete,
          'rest',
          'user:default/test-user',
          false,
        ),
      ).rejects.toThrow(
        `A metadata for policy '${policyToString(
          groupingPoliciesToDelete[0],
        )}' was not found`,
      );
    });

    it('should fail to remove grouping policy with source "configuration"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'configuration',
          };
        });

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await expect(
        enfDelegate.removeGroupingPolicies(
          groupingPoliciesToDelete,
          'rest',
          'user:default/test-user',
          false,
        ),
      ).rejects.toThrow(
        `Error: Attempted to modify an immutable pre-defined policy '${policyToString(
          groupingPoliciesToDelete[0],
        )}'. This policy cannot be altered directly. If you need to make changes, consider removing the associated RBAC admin '${
          groupingPoliciesToDelete[0][0]
        }' using the application configuration.`,
      );
    });

    it('should fail to remove grouping policy with source "csv-file"', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await expect(
        enfDelegate.removeGroupingPolicies(
          groupingPoliciesToDelete,
          'rest',
          'user:default/test-user',
          false,
        ),
      ).rejects.toThrow(
        `policy '${policyToString(
          groupingPoliciesToDelete[0],
        )}' can be modified or deleted only with help of 'policies-csv-file'`,
      );
    });

    it('should be removed grouping policy even with source "csv-file", when corresponding flag is enabled', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'csv-file',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      enfFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        'rest',
        CSV_PERMISSION_POLICY_FILE_AUTHOR,
        true,
        true,
      );

      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(groupingPoliciesToDelete[0], expect.anything());
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(groupingPoliciesToDelete[1], expect.anything());
      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );
    });
  });

  describe('addOrUpdatePolicy', () => {
    it('should add policy', async () => {
      const enfDelegate = await createEnfDelegate([]);
      enfAddPolicySpy.mockClear();

      await enfDelegate.addOrUpdatePolicy(policy, 'rest', false);

      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', policy, expect.anything());
      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policy);
    });

    it('should update legacy policy', async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'legacy',
          };
        });
      const enfDelegate = await createEnfDelegate([policy]);
      enfAddPolicySpy.mockClear();

      await enfDelegate.addOrUpdatePolicy(policy, 'rest', false);

      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenCalledWith(policy, expect.anything());
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', policy, expect.anything());
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...policy);
      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policy);
    });
  });

  describe('addOrUpdateGroupingPolicy', () => {
    it('should add grouping policy', async () => {
      (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReturnValue(
        Promise.resolve(undefined),
      );
      enfUpdateGroupingPolicySpy.mockClear();

      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addOrUpdateGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef: 'role:default/dev-team',
      });

      expect(enfUpdateGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicy,
      );
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalled();
      expect(
        (roleMetadataStorageMock.createRoleMetadata as jest.Mock).mock.calls
          .length,
      ).toEqual(1);
      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];
      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);

      expect(metadata.source).toEqual('rest');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
    });

    it('should update grouping policy', async () => {
      (
        policyMetadataStorageMock.findPolicyMetadata as jest.Mock
      ).mockReturnValue({
        source: 'legacy',
      });
      (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReturnValue(
        Promise.resolve({
          roleEntityRef: 'role:default/dev-team',
          source: 'legacy',
          createdAt: '2024-03-01 00:23:41+00',
        }),
      );
      enfUpdateGroupingPolicySpy.mockClear();
      enfRemoveGroupingPolicySpy.mockClear();

      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      await enfDelegate.addOrUpdateGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef: 'role:default/dev-team',
      });

      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.updateRoleMetadata as jest.Mock
      ).mock.calls[0][0];
      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.source).toEqual('rest');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(
        policyMetadataStorageMock.findPolicyMetadata,
      ).toHaveBeenCalledTimes(2);
      expect(
        policyMetadataStorageMock.removePolicyMetadata,
      ).toHaveBeenNthCalledWith(1, groupingPolicy, expect.anything());
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicy,
      );

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.removeRoleMetadata).not.toHaveBeenCalled();

      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(enfAddGroupingPolicySpy).toHaveBeenCalledTimes(1);
    });
  });
});
