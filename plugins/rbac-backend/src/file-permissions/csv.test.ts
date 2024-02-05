import { TokenManager } from '@backstage/backend-common';

import {
  Adapter,
  Enforcer,
  FileAdapter,
  Model,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import { isEqual } from 'lodash';
import { Logger } from 'winston';

import {
  PermissionPolicyMetadata,
  RoleMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { resolve } from 'path';

import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../database/policy-metadata-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import { BackstageRoleManager } from '../service/role-manager';
import {
  addPermissionPoliciesFileData,
  loadFilteredGroupingPoliciesFromCSV,
  loadFilteredPoliciesFromCSV,
} from './csv';

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

const tokenManagerMock = {
  getToken: jest.fn().mockImplementation(async () => {
    return Promise.resolve({ token: 'some-token' });
  }),
  authenticate: jest.fn().mockImplementation(),
};

const loggerMock: any = {
  warn: jest.fn().mockImplementation(),
  debug: jest.fn().mockImplementation(),
};

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  log: Logger,
  tokenManager: TokenManager,
): Promise<Enforcer> {
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(catalogApi, log, tokenManager);
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

describe('CSV file', () => {
  let enfAddPolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemovePolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfAddGroupingSpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemoveGroupingSpy: jest.SpyInstance<Promise<boolean>, string[], any>;

  const user: string = 'user:default/guest';
  const resourceType: string = 'catalog.entity.create';
  const action: string = 'use';

  describe('Loading filtered policies from a CSV file', () => {
    let csvPermFile: string;
    let enf: Enforcer;
    let enfDelegate: EnforcerDelegate;
    let knex: Knex.Knex;
    beforeEach(async () => {
      loggerMock.warn = jest.fn().mockImplementation();
      policyMetadataStorageMock.findPolicyMetadata = jest
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
        );

      csvPermFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/rbac-policy.csv',
      );
      const adapter = new FileAdapter(csvPermFile);

      const stringModel = newModelFromString(MODEL);
      enf = await createEnforcer(
        stringModel,
        adapter,
        loggerMock,
        tokenManagerMock,
      );

      knex = Knex.knex({ client: MockClient });

      enfDelegate = new EnforcerDelegate(
        enf,
        policyMetadataStorageMock,
        roleMetadataStorageMock,
        knex,
      );

      enfAddPolicySpy = jest.spyOn(enf, 'addPolicy');
      enfRemovePolicySpy = jest.spyOn(enf, 'removePolicy');
      enfAddGroupingSpy = jest.spyOn(enf, 'addGroupingPolicy');
      enfRemoveGroupingSpy = jest.spyOn(enf, 'removeGroupingPolicy');
    });

    afterEach(() => {
      (loggerMock.warn as jest.Mock).mockReset();
      (policyMetadataStorageMock.findPolicyMetadata as jest.Mock).mockReset();
    });

    it('should update a policy that has changed in the file (allow -> deny)', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const updatedPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'deny',
      ];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);
      expect(await enfDelegate.hasPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        resourceType,
        action,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...updatedPolicy);
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(false);
      expect(await enfDelegate.hasPolicy(...updatedPolicy)).toBe(true);
    });

    it('should update a policy that has changed in the file (deny -> allow)', async () => {
      const originalPolicy = [
        'role:default/catalog-deleter',
        'catalog-entity',
        'delete',
        'deny',
      ];
      const updatedPolicy = [
        'role:default/catalog-deleter',
        'catalog-entity',
        'delete',
        'allow',
      ];
      const denyResource = 'catalog-entity';
      const denyAction = 'delete';

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);
      expect(await enfDelegate.hasPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        denyResource,
        denyAction,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...updatedPolicy);
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(false);
      expect(await enfDelegate.hasPolicy(...updatedPolicy)).toBe(true);
    });

    it('should add a policy that is new in the file', async () => {
      const newPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.delete',
        'delete',
        'allow',
      ];

      const newResourceType = 'catalog.entity.delete';
      const newAction = 'delete';

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...newPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        newResourceType,
        newAction,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...newPolicy);

      expect(await enfDelegate.hasPolicy(...newPolicy)).toBe(true);
    });

    it('should remove a policy that is no longer in the file', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog-entity',
        'read',
        'allow',
      ];

      const originalResource = 'catalog-entity';
      const originalAction = 'read';

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        originalResource,
        originalAction,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(false);
    });

    it('should do nothing if there is no change', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const originalPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/rbac-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        originalPolicyFile,
        enfDelegate,
        user,
        resourceType,
        action,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledTimes(0);
      expect(enfRemovePolicySpy).toHaveBeenCalledTimes(0);

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);
    });

    // Validation tests
    it('should fail to update a policy that has changed in the file, entityRef error', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const updatedPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'deny',
      ];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/permission-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);
      expect(await enfDelegate.hasPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        resourceType,
        action,
        loggerMock,
        policyMetadataStorageMock,
      );
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate policy from file ${updatedPolicyFile}. Cause: Entity reference \"role:default/\" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to update a policy that has changed in the file, duplicate error', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        resourceType,
        action,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        1,
        `Duplicate policy: ${originalPolicy} found in the file ${updatedPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        2,
        `Duplicate policy: ${originalPolicy} found in the file ${updatedPolicyFile}`,
      );
    });

    it('should fail to update a policy that has changed in the file, duplicate error different actions', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policies-actions.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        resourceType,
        action,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        1,
        `Duplicate policy: ${originalPolicy.at(0)}, ${originalPolicy.at(
          1,
        )}, ${originalPolicy.at(
          2,
        )} with different actions found with the source csv-file`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        2,
        `Duplicate policy: ${originalPolicy.at(0)}, ${originalPolicy.at(
          1,
        )}, ${originalPolicy.at(
          2,
        )} with different actions found with the source csv-file`,
      );
    });

    it('should fail to update a policy that has changed in the file, duplicate error different source', async () => {
      const originalPolicy = [
        'role:default/catalog-writer',
        'catalog-entity',
        'delete',
        'allow',
      ];

      await enfDelegate.addPolicy(originalPolicy, 'rest');

      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            if (isEqual(policy, originalPolicy)) {
              return { source: 'rest' };
            }
            return { source: 'csv-file' };
          },
        );

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policy.csv',
      );

      expect(await enfDelegate.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        'catalog-entity',
        'delete',
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Duplicate policy: ${originalPolicy.at(0)}, ${originalPolicy.at(
          1,
        )}, ${originalPolicy.at(2)} found with the source rest`,
      );
    });
  });

  describe('Loading filtered grouping policies from a CSV file', () => {
    let csvPermFile: string;
    let enf: Enforcer;
    let enfDelegate: EnforcerDelegate;
    beforeEach(async () => {
      policyMetadataStorageMock.findPolicyMetadata = jest
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
        );

      csvPermFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/rbac-policy.csv',
      );
      const adapter = new FileAdapter(csvPermFile);

      const stringModel = newModelFromString(MODEL);
      enf = await createEnforcer(
        stringModel,
        adapter,
        loggerMock,
        tokenManagerMock,
      );

      const knex = Knex.knex({ client: MockClient });

      enfDelegate = new EnforcerDelegate(
        enf,
        policyMetadataStorageMock,
        roleMetadataStorageMock,
        knex,
      );

      enfAddPolicySpy = jest.spyOn(enf, 'addPolicy');
      enfRemovePolicySpy = jest.spyOn(enf, 'removePolicy');
      enfAddGroupingSpy = jest.spyOn(enf, 'addGroupingPolicy');
      enfRemoveGroupingSpy = jest.spyOn(enf, 'removeGroupingPolicy');
    });

    afterEach(() => {
      (loggerMock.warn as jest.Mock).mockReset();
      (policyMetadataStorageMock.findPolicyMetadata as jest.Mock).mockReset();
    });

    it('should update a policy that has changed in the file', async () => {
      const originalPolicy = [
        'user:default/guest',
        'role:default/catalog-reader',
      ];
      const updatedPolicy = [
        'user:default/guest',
        'role:default/catalog-updater',
      ];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(true);
      expect(await enfDelegate.hasGroupingPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredGroupingPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddGroupingSpy).toHaveBeenCalledWith(...updatedPolicy);
      expect(enfRemoveGroupingSpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(
        false,
      );
      expect(await enfDelegate.hasGroupingPolicy(...updatedPolicy)).toBe(true);
    });

    it('should add a role that is new in the file', async () => {
      const newPolicy = ['user:default/guest', 'role:default/catalog-tester'];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasGroupingPolicy(...newPolicy)).toBe(false);

      await loadFilteredGroupingPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddGroupingSpy).toHaveBeenCalledWith(...newPolicy);

      expect(await enfDelegate.hasGroupingPolicy(...newPolicy)).toBe(true);
    });

    it('should remove a policy that is no longer in the file', async () => {
      const originalPolicy = [
        'user:default/guest',
        'role:default/catalog-deleter',
      ];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(true);

      await loadFilteredGroupingPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfRemoveGroupingSpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(
        false,
      );
    });

    it('should do nothing if there is no change', async () => {
      const originalPolicy = [
        'user:default/guest',
        'role:default/catalog-writer',
      ];
      const originalPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/rbac-policy.csv',
      );

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(true);

      await loadFilteredGroupingPoliciesFromCSV(
        originalPolicyFile,
        enfDelegate,
        user,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(enfAddGroupingSpy).toHaveBeenCalledTimes(0);
      expect(enfRemoveGroupingSpy).toHaveBeenCalledTimes(0);

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(true);
    });

    // Validation tests
    it('should fail to update a policy that has changed in the file, user entityRef error', async () => {
      const originalPolicy = [
        'user:default/guest',
        'role:default/catalog-deleter',
      ];
      const updatedPolicy = [
        'user:default/test',
        'role:default/catalog-deleter',
      ];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/entityref-policy.csv',
      );

      expect(await enfDelegate.hasGroupingPolicy(...originalPolicy)).toBe(true);
      expect(await enfDelegate.hasGroupingPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredGroupingPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        user,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate role from file ${updatedPolicyFile}. Cause: Entity reference \"user:default/\" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to update a policy that has changed in the file, role entityRef error', async () => {
      const newUser = 'user:default/test';
      const newPolicy = ['user:default/test', 'role:default/catalog-reader'];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/role-entityref-policy.csv',
      );

      expect(await enfDelegate.hasGroupingPolicy(...newPolicy)).toBe(false);

      await loadFilteredGroupingPoliciesFromCSV(
        updatedPolicyFile,
        enfDelegate,
        newUser,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate role from file ${updatedPolicyFile}. Cause: Entity reference \"role:default/\" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to update a policy that has changed in the file, duplicate error with and without different sources', async () => {
      const duplicateCSV = [
        'user:default/guest',
        'role:default/catalog-deleter',
      ];
      const duplicateRest = [
        'user:default/guest',
        'role:default/catalog-updater',
      ];

      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            if (isEqual(policy, duplicateRest)) {
              return { source: 'rest' };
            }
            return { source: 'csv-file' };
          },
        );

      await enfDelegate.addGroupingPolicy(duplicateRest, 'rest');

      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policy.csv',
      );

      await loadFilteredGroupingPoliciesFromCSV(
        errorPolicyFile,
        enfDelegate,
        user,
        loggerMock,
        policyMetadataStorageMock,
      );

      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        1,
        `Duplicate role: ${duplicateCSV} found in the file ${errorPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        2,
        `Duplicate role: ${duplicateCSV} found in the file ${errorPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        3,
        `Duplicate role: ${duplicateRest[0]}, ${duplicateRest[1]} found with the source rest`,
      );
    });
  });

  describe('Loading policies from a CSV file', () => {
    let csvPermFile: string;
    let enf: Enforcer;
    let enfDelegate: EnforcerDelegate;

    beforeEach(async () => {
      const adapter = new StringAdapter(
        `
          p, user:default/known_user, test.resource.deny, use, allow
        `,
      );
      csvPermFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/rbac-policy.csv',
      );

      const stringModel = newModelFromString(MODEL);
      enf = await createEnforcer(
        stringModel,
        adapter,
        loggerMock,
        tokenManagerMock,
      );

      const knex = Knex.knex({ client: MockClient });

      enfDelegate = new EnforcerDelegate(
        enf,
        policyMetadataStorageMock,
        roleMetadataStorageMock,
        knex,
      );
    });

    afterEach(() => {
      (loggerMock.warn as jest.Mock).mockReset();
    });

    it('should add policies from the CSV file', async () => {
      const test = [
        'role:default/catalog-writer',
        'catalog-entity',
        'update',
        'allow',
      ];
      await addPermissionPoliciesFileData(
        csvPermFile,
        enfDelegate,
        roleMetadataStorageMock,
        loggerMock,
      );

      expect(await enfDelegate.hasPolicy(...test)).toBe(true);
    });

    // Validation tests
    it('should fail to add policies from the CSV file, user entityRef group error', async () => {
      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/entityref-policy.csv',
      );

      await addPermissionPoliciesFileData(
        errorPolicyFile,
        enfDelegate,
        roleMetadataStorageMock,
        loggerMock,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate group policy user:default/,role:default/catalog-deleter from file ${errorPolicyFile}. Cause: Entity reference \"user:default/\" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to add policies from the CSV file, role entityRef group error', async () => {
      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/role-entityref-policy.csv',
      );

      await addPermissionPoliciesFileData(
        errorPolicyFile,
        enfDelegate,
        roleMetadataStorageMock,
        loggerMock,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate group policy user:default/test,role:default/ from file ${errorPolicyFile}. Cause: Entity reference \"role:default/\" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to add policies from the CSV file, role entityRef permission policy error', async () => {
      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/permission-policy.csv',
      );

      await addPermissionPoliciesFileData(
        errorPolicyFile,
        enfDelegate,
        roleMetadataStorageMock,
        loggerMock,
      );
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate policy from file ${errorPolicyFile}. Cause: Entity reference \"role:default/\" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to add policies from the CSV file, duplicate permission policies in CSV and in enforcer', async () => {
      const duplicatePolicyCSV = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];

      const duplicateRoleCSV = [
        'user:default/guest',
        'role:default/catalog-deleter',
      ];

      const duplicatePolicyEnforcer = [
        'role:default/catalog-writer',
        'catalog-entity',
        'delete',
        'allow',
      ];

      const duplicateRoleEnforcer = [
        'user:default/guest',
        'role:default/catalog-updater',
      ];

      await enfDelegate.addPolicy(duplicatePolicyEnforcer, 'rest');
      await enfDelegate.addGroupingPolicy(duplicateRoleEnforcer, 'rest');

      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policy.csv',
      );

      await addPermissionPoliciesFileData(
        errorPolicyFile,
        enfDelegate,
        roleMetadataStorageMock,
        loggerMock,
      );

      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        1,
        `Duplicate policy: ${duplicatePolicyEnforcer} found in the file ${errorPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        2,
        `Duplicate policy: ${duplicatePolicyCSV} found in the file ${errorPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        3,
        `Duplicate policy: ${duplicatePolicyCSV} found in the file ${errorPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        4,
        `Duplicate role: ${duplicateRoleCSV} found in the file ${errorPolicyFile}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        5,
        `Duplicate role: ${duplicateRoleCSV} found in the file ${errorPolicyFile}`,
      );
    });
  });
});
