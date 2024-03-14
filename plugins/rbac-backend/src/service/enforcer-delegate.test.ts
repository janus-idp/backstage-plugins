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
  beforeEach(() => {
    (policyMetadataStorageMock.createPolicyMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.createRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReset();
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

      await enfDelegate.addPolicy(policy, 'rest');

      const storePolicies = await enfDelegate.getPolicy();

      expect(storePolicies).toEqual([policy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', policy, expect.anything());
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

      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addGroupingPolicy(groupingPolicy, 'rest');

      const storePolicies = await enfDelegate.getGroupingPolicy();

      expect(storePolicies).toEqual([groupingPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalled();
    });

    it('should add grouping policy, but do not create role metadata', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
          },
        );

      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addGroupingPolicy(groupingPolicy, 'rest');

      const storePolicies = await enfDelegate.getGroupingPolicy();

      expect(storePolicies).toEqual([groupingPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());
      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
    });

    it('should fail to add policy, caused policy metadata storage error', async () => {
      const enfDelegate = await createEnfDelegate();

      policyMetadataStorageMock.createPolicyMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      await expect(
        enfDelegate.addGroupingPolicy(groupingPolicy, 'rest'),
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
        enfDelegate.addGroupingPolicy(groupingPolicy, 'rest'),
      ).rejects.toThrow('some unexpected error');
    });

    it('should not create role metadata if isUpdate is true', async () => {
      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addGroupingPolicy(
        groupingPolicy,
        'rest',
        undefined,
        true,
      );
      const storedPolicies = await enfDelegate.getGroupingPolicy();

      expect(storedPolicies).toEqual([groupingPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
    });

    it('should not create role metadata, because metadata has been created', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
          },
        );

      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addGroupingPolicy(groupingPolicy, 'rest', undefined);
      const storedPolicies = await enfDelegate.getGroupingPolicy();

      expect(storedPolicies).toEqual([groupingPolicy]);
      expect(
        policyMetadataStorageMock.createPolicyMetadata,
      ).toHaveBeenCalledWith('rest', groupingPolicy, expect.anything());

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
    });
  });

  describe('addGroupingPolicies', () => {
    it('should add grouping policies and create role metadata', async () => {
      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
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

    it('should not create role metadata, because metadata has been created', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
          },
        );

      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
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

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
    });
  });

  describe('updateGroupingPolicies', () => {
    it('should update grouping policies: add one more policy', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
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
      expect(roleMetadataStorageMock.updateRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        roleMetadataDao.roleEntityRef,
        expect.anything(),
      );
    });

    it('should update grouping policies: one policy should be removed', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
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
      expect(roleMetadataStorageMock.updateRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        roleMetadataDao.roleEntityRef,
        expect.anything(),
      );
    });

    it('should update grouping policies: role should be renamed', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
        });
      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return { source: 'rest' };
        });

      const oldRoleName = 'role:default/dev-team';
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
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        [groupingPolicyWithRenamedRole, secondGroupingPolicyWithRenamedRole],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(2);
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
      expect(roleMetadataStorageMock.updateRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        oldRoleName,
        expect.anything(),
      );
    });

    it('should update grouping policies: should be update role description', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return { source: 'csv-file', roleEntityRef: 'user:default/tom' };
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
        description: 'some-description',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy],
        [groupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(1);
      expect(storedPolicies).toEqual([groupingPolicy]);
      expect(roleMetadataStorageMock.updateRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        roleMetadataDao.roleEntityRef,
        expect.anything(),
      );
    });
  });
});
