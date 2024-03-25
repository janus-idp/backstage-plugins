import { getVoidLogger, TokenManager } from '@backstage/backend-common';
import { DatabaseService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';

import {
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import { Logger } from 'winston';

import {
  PermissionPolicyMetadata,
  RoleMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { resolve } from 'path';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../database/policy-metadata-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { RBACPermissionPolicy } from './permission-policy';

type PermissionAction = 'create' | 'read' | 'update' | 'delete';

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

const tokenManagerMock = {
  getToken: jest.fn().mockImplementation(async () => {
    return Promise.resolve({ token: 'some-token' });
  }),
  authenticate: jest.fn().mockImplementation(),
};

const conditionalStorage = {
  getConditions: jest.fn().mockImplementation(),
  createCondition: jest.fn().mockImplementation(),
  findCondition: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  findRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadata> => {
        return { source: 'csv-file' };
      },
    ),
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
  findPolicyMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _policy: string[],
        _trx: Knex.Knex.Transaction,
      ): Promise<PermissionPolicyMetadata> => {
        const test: PermissionPolicyMetadata = {
          source: 'csv-file',
        };
        return test;
      },
    ),
  createPolicyMetadata: jest.fn().mockImplementation(),
  removePolicyMetadata: jest.fn().mockImplementation(),
};

const dbManagerMock: DatabaseService = {
  getClient: jest.fn().mockImplementation(),
};

const csvPermFile = resolve(
  __dirname,
  './../__fixtures__/data/valid-csv/rbac-policy.csv',
);

const knex = Knex.knex({ client: MockClient });

describe('RBACPermissionPolicy Tests', () => {
  it('should build', async () => {
    const stringPolicy = `p, user:default/known_user, test-resource, update, allow `;
    const config = newConfigReader();
    const adapter = await newAdapter(config, stringPolicy);
    const enfDelegate = await newEnforcerDelegate(adapter);

    const policy = await newPermissionPolicy(config, enfDelegate);

    expect(policy).not.toBeNull();
  });

  describe('Policy checks from csv file', () => {
    let enfDelegate: EnforcerDelegate;
    let policy: RBACPermissionPolicy;

    beforeEach(async () => {
      const config = newConfigReader();
      const adapter = await newAdapter(config);
      enfDelegate = await newEnforcerDelegate(adapter);
      policy = await newPermissionPolicy(config, enfDelegate);

      catalogApi.getEntities.mockReturnValue({ items: [] });
    });

    // case1
    it('should allow read access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'read',
        ),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case2
    it('should allow create access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('catalog.entity.create'),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case3
    it('should allow deny access to resource permission for user:default/known_user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case1 with role
    it('should allow update access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'update',
        ),
        newIdentityResponse('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // case2 with role
    it('should allow update access to resource permission for role from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'update',
        ),
        newIdentityResponse('role:default/catalog-writer'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });
  });

  describe('Policy checks for clean up old policies for csv file', () => {
    let config: ConfigReader;
    let adapter: Adapter;
    let enforcerDelegate: EnforcerDelegate;
    let rbacPolicy: RBACPermissionPolicy;
    const allEnfRoles = [
      'role:default/some-role',
      'role:default/rbac_admin',
      'role:default/catalog-writer',
      'role:default/catalog-reader',
      'role:default/catalog-deleter',
      'role:default/known_role',
    ];

    const allEnfGroupPolicies = [
      ['user:default/tester', 'role:default/some-role'],
      ['user:default/guest', 'role:default/rbac_admin'],
      ['group:default/guests', 'role:default/rbac_admin'],
      ['user:default/guest', 'role:default/catalog-writer'],
      ['user:default/guest', 'role:default/catalog-reader'],
      ['user:default/guest', 'role:default/catalog-deleter'],
      ['user:default/known_user', 'role:default/known_role'],
    ];

    const allEnfPolicies = [
      // stored policy
      ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      // policies from csv file
      ['role:default/catalog-writer', 'catalog-entity', 'update', 'allow'],
      ['role:default/catalog-writer', 'catalog-entity', 'read', 'allow'],
      ['role:default/catalog-writer', 'catalog.entity.create', 'use', 'allow'],
      ['role:default/catalog-deleter', 'catalog-entity', 'delete', 'deny'],
      ['role:default/known_role', 'test.resource.deny', 'use', 'allow'],
    ];

    const policyMetadataStorage: PolicyMetadataStorage = {
      findPolicyMetadataBySource: jest.fn().mockImplementation(),
      findPolicyMetadata: jest
        .fn()
        .mockImplementation(async (): Promise<PermissionPolicyMetadata> => {
          return Promise.resolve({ source: 'csv-file' });
        }),
      createPolicyMetadata: jest.fn().mockImplementation(),
      removePolicyMetadata: jest.fn().mockImplementation(),
    };

    beforeEach(async () => {
      (roleMetadataStorageMock.removeRoleMetadata as jest.Mock).mockReset();
      (policyMetadataStorage.removePolicyMetadata as jest.Mock).mockReset();

      config = newConfigReader();
      adapter = await newAdapter(config);

      catalogApi.getEntities.mockReturnValue({ items: [] });
    });

    it('should cleanup old group policies and metadata after re-attach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      policyMetadataStorage.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'csv-file') {
              return [
                {
                  id: 0,
                  policy: '[user:default/user-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 1,
                  policy: '[group:default/team-a-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
              ];
            }
            return [];
          },
        );

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        storedPolicies,
        storedGroupPolicies,
        policyMetadataStorage,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // policy metadata should to be removed
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledTimes(
        2,
      );

      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['user:default/user-old-1', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['group:default/team-a-old-1', 'role:default/old-role'],
        expect.anything(),
      );

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });

    it('should cleanup old policies and metadata after re-attach policy file', async () => {
      const storedGroupPolicies = [
        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      policyMetadataStorage.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'csv-file') {
              return [
                {
                  id: 0,
                  policy:
                    '[role:default/old-role, test.some.resource, use, allow]',
                  source: 'csv-file',
                },
              ];
            }
            return [];
          },
        );

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        storedPolicies,
        storedGroupPolicies,
        policyMetadataStorage,
      );

      rbacPolicy = await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (p: string[]) => {
          return p[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // policy metadata should to be removed
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledTimes(
        1,
      );

      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],
        expect.anything(),
      );

      // role metadata should not be removed
      expect(
        roleMetadataStorageMock.removeRoleMetadata,
      ).not.toHaveBeenCalledWith('role:default/old-role', expect.anything());

      const decision = await rbacPolicy.handle(
        newPolicyQueryWithBasicPermission('test.some.resource'),
        newIdentityResponse('user:default/user-old-1'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });

    it('should cleanup old policies and group policies and metadata after re-attach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['user:default/user-old-2', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-2', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      policyMetadataStorage.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'csv-file') {
              return [
                {
                  id: 0,
                  policy: '[user:default/user-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 1,
                  policy: '[user:default/user-old-2, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 2,
                  policy: '[group:default/team-a-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 3,
                  policy: '[group:default/team-a-old-2, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 4,
                  policy:
                    '[role:default/old-role, test.some.resource, use, allow]',
                  source: 'csv-file',
                },
              ];
            }
            return [];
          },
        );

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        storedPolicies,
        storedGroupPolicies,
        policyMetadataStorage,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // policy metadata should to be removed
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledTimes(
        5,
      );

      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['user:default/user-old-1', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['user:default/user-old-2', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['group:default/team-a-old-1', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['group:default/team-a-old-2', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],
        expect.anything(),
      );

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });

    it('should cleanup old group policies and metadata after detach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      policyMetadataStorage.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'csv-file') {
              return [
                {
                  id: 0,
                  policy: '[user:default/user-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 1,
                  policy: '[group:default/team-a-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
              ];
            }
            return [];
          },
        );

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        storedPolicies,
        storedGroupPolicies,
        policyMetadataStorage,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // policy metadata should to be removed
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledTimes(
        2,
      );

      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['user:default/user-old-1', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['group:default/team-a-old-1', 'role:default/old-role'],
        expect.anything(),
      );

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });

    it('should cleanup old policies after detach policy file', async () => {
      const storedGroupPolicies = [
        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      policyMetadataStorage.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'csv-file') {
              return [
                {
                  id: 0,
                  policy:
                    '[role:default/old-role, test.some.resource, use, allow]',
                  source: 'csv-file',
                },
              ];
            }
            return [];
          },
        );

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        storedPolicies,
        storedGroupPolicies,
        policyMetadataStorage,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // policy metadata should to be removed
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledTimes(
        1,
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],
        expect.anything(),
      );
    });

    it('should cleanup old policies and group policies and metadata after detach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['user:default/user-old-2', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-2', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      policyMetadataStorage.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'csv-file') {
              return [
                {
                  id: 0,
                  policy: '[user:default/user-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 1,
                  policy: '[user:default/user-old-2, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 2,
                  policy: '[group:default/team-a-old-1, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 3,
                  policy: '[group:default/team-a-old-2, role:default/old-role]',
                  source: 'csv-file',
                },
                {
                  id: 4,
                  policy:
                    '[role:default/old-role, test.some.resource, use, allow]',
                  source: 'csv-file',
                },
              ];
            }
            return [];
          },
        );

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        storedPolicies,
        storedGroupPolicies,
        policyMetadataStorage,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // policy metadata should to be removed
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledTimes(
        5,
      );

      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['user:default/user-old-1', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['user:default/user-old-2', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['group:default/team-a-old-1', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['group:default/team-a-old-2', 'role:default/old-role'],
        expect.anything(),
      );
      expect(policyMetadataStorage.removePolicyMetadata).toHaveBeenCalledWith(
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],
        expect.anything(),
      );

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });
  });

  describe('Policy checks for users', () => {
    let policy: RBACPermissionPolicy;
    let enfDelegate: EnforcerDelegate;

    const roleMetadataStorageTest: RoleMetadataStorage = {
      findRoleMetadata: jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadata> => {
            return { source: 'configuration' };
          },
        ),
      createRoleMetadata: jest.fn().mockImplementation(),
      updateRoleMetadata: jest.fn().mockImplementation(),
      removeRoleMetadata: jest.fn().mockImplementation(),
    };

    const policyMetadataStorageTest: PolicyMetadataStorage = {
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

    beforeEach(async () => {
      policyMetadataStorageTest.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            const test: PermissionPolicyMetadata = {
              source: 'configuration',
            };
            return test;
          },
        );

      const basicAndResourcePermissions = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/basic-and-resource-policies.csv',
      );
      const config = newConfigReader(basicAndResourcePermissions);
      const adapter = await newAdapter(config);
      enfDelegate = await newEnforcerDelegate(adapter);

      policy = await newPermissionPolicy(
        config,
        enfDelegate,
        roleMetadataStorageTest,
        policyMetadataStorageTest,
      );

      catalogApi.getEntities.mockReturnValue({ items: [] });
    });
    // +-------+------+------------------------------------+
    // | allow | deny |         result                 |   |
    // +-------+------+--------------------------------+---|
    // | N     | Y    | deny                           | 1 |
    // | N     | N    | deny (user not listed)         | 2 |
    // | Y     | Y    | deny (user:default/duplicated) | 3 |
    // | Y     | N    | allow                          | 4 |

    // Tests for Resource basic type permission

    // case1
    it('should deny access to basic permission for listed user with deny action', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case2
    it('should deny access to basic permission for unlisted user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('unuser:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case3
    it('should deny access to basic permission for listed user deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('user:default/duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case4
    it('should allow access to basic permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });
    // case5
    it('should deny access to undefined user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newIdentityResponse(),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });

    // Tests for Resource Permission type

    // case1
    it('should deny access to resource permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.deny',
          'test-resource-deny',
          'update',
        ),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case 2
    it('should deny access to resource permission for user unlisted on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newIdentityResponse('unuser:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case 3
    it('should deny access to resource permission for user listed deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newIdentityResponse('user:default/duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });
    // case 4
    it('should allow access to resource permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    // Tests for actions on resource permissions
    it('should deny access to resource permission for unlisted action for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'delete',
        ),
        newIdentityResponse('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });

    // Tests for admin added through app config
    it('should allow access to permission resources for admin added through app config', async () => {
      const adminPerm: {
        name: string;
        resource: string;
        action: PermissionAction;
      }[] = [
        {
          name: 'policy.entity.read',
          resource: 'policy-entity',
          action: 'read',
        },
        {
          name: 'policy.entity.create',
          resource: 'policy-entity',
          action: 'create',
        },
        {
          name: 'policy.entity.update',
          resource: 'policy-entity',
          action: 'update',
        },
        {
          name: 'policy.entity.delete',
          resource: 'policy-entity',
          action: 'delete',
        },
        {
          name: 'catalog.entity.read',
          resource: 'catalog-entity',
          action: 'read',
        },
      ];
      for (const perm of adminPerm) {
        const decision = await policy.handle(
          newPolicyQueryWithResourcePermission(
            perm.name,
            perm.resource,
            perm.action,
          ),
          newIdentityResponse('user:default/guest'),
        );
        expect(decision.result).toBe(AuthorizeResult.ALLOW);
      }
    });
  });

  describe('Policy checks from config file', () => {
    let policy: RBACPermissionPolicy;
    let enfDelegate: EnforcerDelegate;
    const roleMetadataStorageTest: RoleMetadataStorage = {
      findRoleMetadata: jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadata> => {
            return { source: 'legacy' };
          },
        ),
      createRoleMetadata: jest.fn().mockImplementation(),
      updateRoleMetadata: jest.fn().mockImplementation(),
      removeRoleMetadata: jest.fn().mockImplementation(),
    };

    const policyMetadataStorageTest: PolicyMetadataStorage = {
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

    const adminRole = 'role:default/rbac_admin';
    const groupPolicy = [
      ['user:default/old_admin', 'role:default/rbac_admin'],
      ['user:default/test_admin', 'role:default/rbac_admin'],
    ];
    const permissions = [
      ['role:default/rbac_admin', 'policy-entity', 'read', 'allow'],
      ['role:default/rbac_admin', 'policy-entity', 'create', 'allow'],
      ['role:default/rbac_admin', 'policy-entity', 'delete', 'allow'],
      ['role:default/rbac_admin', 'policy-entity', 'update', 'allow'],
      ['role:default/rbac_admin', 'catalog-entity', 'read', 'allow'],
    ];
    const oldGroupPolicy = [
      'user:default/old_admin',
      'role:default/rbac_admin',
    ];
    const admins = new Array<{ name: string }>();
    admins.push({ name: 'user:default/test_admin' });
    const superUser = new Array<{ name: string }>();
    superUser.push({ name: 'user:default/super_user' });

    catalogApi.getEntities.mockReturnValue({ items: [] });

    beforeEach(async () => {
      policyMetadataStorageTest.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'configuration') {
              return [
                {
                  id: 0,
                  policy: '[user:default/old_admin, role:default/rbac_admin]',
                  source: 'configuration',
                },
                {
                  id: 1,
                  policy: '[user:default/test_admin, role:default/rbac_admin]',
                  source: 'configuration',
                },
              ];
            }
            return [];
          },
        );

      policyMetadataStorageTest.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            const test: PermissionPolicyMetadata = {
              source: 'configuration',
            };
            return test;
          },
        );

      const config = newConfigReader(csvPermFile, admins, superUser);
      const adapter = await newAdapter(config);

      enfDelegate = await newEnforcerDelegate(adapter);

      await enfDelegate.addGroupingPolicy(oldGroupPolicy, 'configuration');

      policy = await newPermissionPolicy(
        config,
        enfDelegate,
        roleMetadataStorageTest,
        policyMetadataStorageTest,
      );
    });

    it('should build the admin permissions', async () => {
      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);
      expect(enfRole).toEqual(groupPolicy);
      expect(enfPermission).toEqual(permissions);
    });

    it('should build and update a legacy admin permission', async () => {
      roleMetadataStorageTest.findRoleMetadata = jest
        .fn()
        .mockImplementationOnce(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadata> => {
            return { source: 'legacy' };
          },
        );

      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);

      expect(enfRole).toEqual(groupPolicy);
      expect(enfPermission).toEqual(permissions);
      expect(roleMetadataStorageTest.removeRoleMetadata).toHaveBeenCalled();
      expect(roleMetadataStorageTest.createRoleMetadata).toHaveBeenCalled();
    });

    it('should allow read access to resource permission for user from config file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'policy.entity.read',
          'policy-entity',
          'read',
        ),
        newIdentityResponse('user:default/test_admin'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
    });

    it('should allow read access to resource permission for super user from config file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'policy.entity.read',
          'policy-entity',
          'read',
        ),
        newIdentityResponse('user:default/super_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      const decision2 = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.delete',
          'catalog-entity',
          'delete',
        ),
        newIdentityResponse('user:default/super_user'),
      );
      expect(decision2.result).toBe(AuthorizeResult.ALLOW);
    });

    it('should remove users that are no longer in the config file', async () => {
      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);
      expect(enfRole).toEqual(groupPolicy);
      expect(enfRole).not.toContain(oldGroupPolicy);
      expect(enfPermission).toEqual(permissions);
    });
  });
});

// Notice: There is corner case, when "resourced" permission policy can be defined not by resource type, but by name.
describe('Policy checks for resourced permissions defined by name', () => {
  const roleMetadataStorageTest: RoleMetadataStorage = {
    findRoleMetadata: jest
      .fn()
      .mockImplementation(
        async (
          _roleEntityRef: string,
          _trx: Knex.Knex.Transaction,
        ): Promise<RoleMetadata> => {
          return { source: 'rest' };
        },
      ),
    createRoleMetadata: jest.fn().mockImplementation(),
    updateRoleMetadata: jest.fn().mockImplementation(),
    removeRoleMetadata: jest.fn().mockImplementation(),
  };
  const policyMetadataStorageTest: PolicyMetadataStorage = {
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
  let enfDelegate: EnforcerDelegate;
  let policy: RBACPermissionPolicy;

  beforeEach(async () => {
    const config = newConfigReader();
    const adapter = await newAdapter(config);
    enfDelegate = await newEnforcerDelegate(adapter);
    policy = await newPermissionPolicy(
      config,
      enfDelegate,
      roleMetadataStorageTest,
      policyMetadataStorageTest,
    );
  });

  it('should allow access to resourced permission assigned by name', async () => {
    catalogApi.getEntities.mockReturnValue({ items: [] });

    await enfDelegate.addGroupingPolicy(
      ['user:default/tor', 'role:default/catalog_reader'],
      'csv-file',
    );
    await enfDelegate.addPolicy(
      ['role:default/catalog_reader', 'catalog.entity.read', 'read', 'allow'],
      'csv-file',
    );

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should allow access to resourced permission assigned by name, because it has higher priority then permission for the same resource assigned by resource type', async () => {
    catalogApi.getEntities.mockReturnValue({ items: [] });

    await enfDelegate.addGroupingPolicy(
      ['user:default/tor', 'role:default/catalog_reader'],
      'csv-file',
    );
    await enfDelegate.addPolicies(
      [
        ['role:default/catalog_reader', 'catalog.entity.read', 'read', 'allow'],
        ['role:default/catalog_reader', 'catalog-entity', 'read', 'deny'],
      ],
      'csv-file',
    );

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should deny access to resourced permission assigned by name, because it has higher priority then permission for the same resource assigned by resource type', async () => {
    catalogApi.getEntities.mockReturnValue({ items: [] });

    await enfDelegate.addGroupingPolicy(
      ['user:default/tor', 'role:default/catalog_reader'],
      'csv-file',
    );
    await enfDelegate.addPolicies(
      [
        ['role:default/catalog_reader', 'catalog.entity.read', 'read', 'deny'],
        ['role:default/catalog_reader', 'catalog-entity', 'read', 'allow'],
      ],
      'csv-file',
    );

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from his group', async () => {
    const groupEntityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'team-a',
        namespace: 'default',
      },
      spec: {
        members: ['tor'],
      },
    };
    catalogApi.getEntities.mockImplementation(_arg => {
      return { items: [groupEntityMock] };
    });

    await enfDelegate.addGroupingPolicy(
      ['group:default/team-a', 'role:default/catalog_user'],
      'csv-file',
    );
    await enfDelegate.addPolicies(
      [['role:default/catalog_user', 'catalog.entity.read', 'read', 'allow']],
      'csv-file',
    );

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from few groups', async () => {
    const groupEntityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'team-a',
        namespace: 'default',
      },
      spec: {
        members: ['tor'],
        parent: 'team-b',
      },
    };
    const groupParentMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'team-b',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockImplementation(_arg => {
      return { items: [groupParentMock, groupEntityMock] };
    });

    await enfDelegate.addGroupingPolicy(
      ['group:default/team-b', 'role:default/catalog_user'],
      'csv-file',
    );
    await enfDelegate.addGroupingPolicy(
      ['group:default/team-a', 'group:default/team-b'],
      'csv-file',
    );
    await enfDelegate.addPolicies(
      [['role:default/catalog_user', 'catalog.entity.read', 'read', 'allow']],
      'csv-file',
    );

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newIdentityResponse('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });
});

describe('Policy checks for users and groups', () => {
  let policy: RBACPermissionPolicy;

  beforeEach(async () => {
    const policyChecksCSV = resolve(
      __dirname,
      './../__fixtures__/data/valid-csv/policy-checks.csv',
    );
    const config = newConfigReader(policyChecksCSV);
    const adapter = await newAdapter(config);

    const enfDelegate = await newEnforcerDelegate(adapter);

    policy = await newPermissionPolicy(config, enfDelegate);

    catalogApi.getEntities.mockReset();
  });

  // User inherits permissions from groups and their parent groups.
  // This behavior can be configured with `policy_effect` in the model.
  // Also it can be customized using casbin function.
  // Test suite table:
  // +-------+---------+----------+-------+
  // | Group |  User   |  result  | case# |
  // +-------+---------+----------+-------+
  // | deny  |  allow  |  deny    |   1   | +
  // | deny  |    -    |  deny    |   2   | +
  // | deny  |  deny   |  deny    |   3   | +
  // +-------+---------+----------+-------+
  // | allow | allow   | allow    |   4   | +
  // | allow |   -     | allow    |   5   | +
  // | allow |  deny   | deny     |   6   |
  // +-------+---------+----------+-------+

  // Basic type permissions

  // case1
  it('should deny access to basic permission for user Alice with "allow" "use" action, when her group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
      spec: {
        members: ['alice'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/alice'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case2
  it('should deny access to basic permission for user Akira without("-") "use" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
      spec: {
        members: ['akira'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/akira'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case3
  it('should deny access to basic permission for user Antey with "deny" "use" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
      spec: {
        members: ['antey'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/antey'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case4
  it('should allow access to basic permission for user Julia with "allow" "use" action, when her group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/julia'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case5
  it('should allow access to basic permission for user Mike without("-") "use" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        members: ['mike'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case6
  it('should deny access to basic permission for user Tom with "deny" "use" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        members: ['tom'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newIdentityResponse('user:default/tom'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // inheritance case
  it('should allow access to basic permission to test.resource.2 for user Mike with "-" "use" action definition, when parent group of his group "allow" this action', async () => {
    const groupMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        members: ['mike'],
        parent: 'data_parent_admin',
      },
    };

    const groupParentMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_parent_admin',
        namespace: 'default',
      },
    };

    catalogApi.getEntities.mockImplementation(_arg => {
      return { items: [groupMock, groupParentMock] };
    });

    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource.2'),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // Resource type permissions

  // case1
  it('should deny access to basic permission for user Alice with "allow" "read" action, when her group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
      spec: {
        members: ['alice'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/alice'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case2
  it('should deny access to basic permission for user Akira without("-") "read" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/akira'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case3
  it('should deny access to basic permission for user Antey with "deny" "read" action definition, when his group "deny" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/antey'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // case4
  it('should allow access to basic permission for user Julia with "allow" "read" action, when her group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/julia'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case5
  it('should allow access to basic permission for user Mike without("-") "read" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        members: ['mike'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  // case6
  it('should deny access to basic permission for user Tom with "deny" "read" action definition, when his group "allow" this action', async () => {
    const entityMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        members: ['tom'],
      },
    };
    catalogApi.getEntities.mockReturnValue({ items: [entityMock] });
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newIdentityResponse('user:default/tom'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
  });

  // inheritance case
  it('should allow access to resource permission to test-resource for user Mike with "-" "write" action definition, when parent group of his group "allow" this action', async () => {
    const groupMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_read_admin',
        namespace: 'default',
      },
      spec: {
        members: ['mike'],
        parent: 'data_parent_admin',
      },
    };

    const groupParentMock: Entity = {
      apiVersion: 'v1',
      kind: 'Group',
      metadata: {
        name: 'data_parent_admin',
        namespace: 'default',
      },
    };

    catalogApi.getEntities.mockImplementation(_arg => {
      return { items: [groupParentMock, groupMock] };
    });

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.create',
        'test-resource',
        'create',
      ),
      newIdentityResponse('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });
});

function newPolicyQueryWithBasicPermission(name: string): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
  });
  return { permission: mockPermission };
}

function newPolicyQueryWithResourcePermission(
  name: string,
  resource: string,
  action: PermissionAction,
): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
    resourceType: resource,
  });
  if (action) {
    mockPermission.attributes.action = action;
  }
  return { permission: mockPermission };
}

function newIdentityResponse(
  user?: string,
): BackstageIdentityResponse | undefined {
  if (user) {
    return {
      identity: {
        ownershipEntityRefs: [],
        type: 'user',
        userEntityRef: user,
      },
      token: '',
    };
  }
  return undefined;
}

function newConfigReader(
  permFile?: string,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
): ConfigReader {
  const testUsers = [
    {
      name: 'user:default/guest',
    },
    {
      name: 'group:default/guests',
    },
  ];

  return new ConfigReader({
    permission: {
      rbac: {
        'policies-csv-file': permFile || csvPermFile,
        policyFileReload: true,
        admin: {
          users: users || testUsers,
          superUsers: superUsers,
        },
      },
    },
    backend: {
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
  });
}

async function newAdapter(
  config: ConfigReader,
  stringPolicy?: string,
): Promise<Adapter> {
  if (stringPolicy) {
    return new StringAdapter(stringPolicy);
  }
  return await new CasbinDBAdapterFactory(
    config,
    dbManagerMock,
  ).createAdapter();
}

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: Logger,
  tokenManager: TokenManager,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogApi,
    logger,
    tokenManager,
    catalogDBClient,
  );
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

async function newEnforcerDelegate(
  adapter: Adapter,
  storedPolicies?: string[][],
  storedGroupingPolicies?: string[][],
  policyMock?: PolicyMetadataStorage,
): Promise<EnforcerDelegate> {
  const theModel = newModelFromString(MODEL);
  const logger = getVoidLogger();

  const enf = await createEnforcer(theModel, adapter, logger, tokenManagerMock);

  if (storedPolicies) {
    await enf.addPolicies(storedPolicies);
  }

  if (storedGroupingPolicies) {
    await enf.addGroupingPolicies(storedGroupingPolicies);
  }

  return new EnforcerDelegate(
    enf,
    policyMock || policyMetadataStorageMock,
    roleMetadataStorageMock,
    knex,
  );
}

async function newPermissionPolicy(
  config: ConfigReader,
  enfDelegate: EnforcerDelegate,
  roleMock?: RoleMetadataStorage,
  policyMock?: PolicyMetadataStorage,
): Promise<RBACPermissionPolicy> {
  const logger = getVoidLogger();
  return await RBACPermissionPolicy.build(
    logger,
    config,
    conditionalStorage,
    enfDelegate,
    roleMock || roleMetadataStorageMock,
    policyMock || policyMetadataStorageMock,
    knex,
  );
}
