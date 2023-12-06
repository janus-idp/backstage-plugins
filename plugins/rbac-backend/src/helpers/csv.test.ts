import { getVoidLogger, TokenManager } from '@backstage/backend-common';

import {
  Adapter,
  Enforcer,
  FileAdapter,
  Model,
  newEnforcer,
  newModelFromString,
  StringAdapter,
} from 'casbin';
import { Logger } from 'winston';

import { resolve } from 'path';

import { MODEL } from '../service/permission-model';
import { BackstageRoleManager } from '../service/role-manager';
import {
  loadFilteredGroupingPoliciesFromCSV,
  loadFilteredPoliciesFromCSV,
  loadPoliciesFromCSV,
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

const tokenManagerMock = {
  getToken: jest.fn().mockImplementation(async () => {
    return Promise.resolve({ token: 'some-token' });
  }),
  authenticate: jest.fn().mockImplementation(),
};

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: Logger,
  tokenManager: TokenManager,
): Promise<Enforcer> {
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(catalogApi, logger, tokenManager);
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

describe('CSV file', () => {
  let csvPermFile: string;
  let enf: Enforcer;
  let enfAddPolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemovePolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfAddGroupingSpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemoveGroupingSpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  const user: string = 'user:default/guest';
  const resourceType: string = 'catalog.entity.create';
  const action: string = 'use';

  beforeEach(async () => {
    csvPermFile = resolve(
      __dirname,
      './../__fixtures__/data/valid-csv/rbac-policy.csv',
    );
    const adapter = new FileAdapter(csvPermFile);

    const stringModel = newModelFromString(MODEL);
    const logger = getVoidLogger();
    enf = await createEnforcer(stringModel, adapter, logger, tokenManagerMock);
    enfAddPolicySpy = jest.spyOn(enf, 'addPolicy');
    enfRemovePolicySpy = jest.spyOn(enf, 'removePolicy');
    enfAddGroupingSpy = jest.spyOn(enf, 'addGroupingPolicy');
    enfRemoveGroupingSpy = jest.spyOn(enf, 'removeGroupingPolicy');
  });
  describe('Loading filtered policies from a CSV file', () => {
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);
      expect(await enf.hasPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enf,
        user,
        resourceType,
        action,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...updatedPolicy);
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enf.hasPolicy(...originalPolicy)).toBe(false);
      expect(await enf.hasPolicy(...updatedPolicy)).toBe(true);
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);
      expect(await enf.hasPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enf,
        user,
        denyResource,
        denyAction,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...updatedPolicy);
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enf.hasPolicy(...originalPolicy)).toBe(false);
      expect(await enf.hasPolicy(...updatedPolicy)).toBe(true);
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

      expect(await enf.hasPolicy(...newPolicy)).toBe(false);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enf,
        user,
        newResourceType,
        newAction,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...newPolicy);

      expect(await enf.hasPolicy(...newPolicy)).toBe(true);
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        updatedPolicyFile,
        enf,
        user,
        originalResource,
        originalAction,
      );

      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enf.hasPolicy(...originalPolicy)).toBe(false);
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);

      await loadFilteredPoliciesFromCSV(
        originalPolicyFile,
        enf,
        user,
        resourceType,
        action,
      );

      expect(enfAddPolicySpy).toHaveBeenCalledTimes(0);
      expect(enfRemovePolicySpy).toHaveBeenCalledTimes(0);

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);
      expect(await enf.hasPolicy(...updatedPolicy)).toBe(false);

      await expect(() =>
        loadFilteredPoliciesFromCSV(
          updatedPolicyFile,
          enf,
          user,
          resourceType,
          action,
        ),
      ).rejects.toThrow(
        `Failed to validate policy from file ${updatedPolicyFile}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);

      await expect(() =>
        loadFilteredPoliciesFromCSV(
          updatedPolicyFile,
          enf,
          user,
          resourceType,
          action,
        ),
      ).rejects.toThrow(
        `Duplicate policy ${originalPolicy} found in the file ${updatedPolicyFile}`,
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

      expect(await enf.hasPolicy(...originalPolicy)).toBe(true);

      await expect(() =>
        loadFilteredPoliciesFromCSV(
          updatedPolicyFile,
          enf,
          user,
          resourceType,
          action,
        ),
      ).rejects.toThrow(
        `Duplicate policy ${originalPolicy[0]}, ${originalPolicy[1]}, ${originalPolicy[2]} with different actions found in the file ${updatedPolicyFile}`,
      );
    });
  });

  describe('Loading filtered grouping policies from a CSV file', () => {
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

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(true);
      expect(await enf.hasGroupingPolicy(...updatedPolicy)).toBe(false);

      await loadFilteredGroupingPoliciesFromCSV(updatedPolicyFile, enf, user);

      expect(enfAddGroupingSpy).toHaveBeenCalledWith(...updatedPolicy);
      expect(enfRemoveGroupingSpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(false);
      expect(await enf.hasGroupingPolicy(...updatedPolicy)).toBe(true);
    });

    it('should add a policy that is new in the file', async () => {
      const newPolicy = ['user:default/guest', 'role:default/catalog-tester'];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/updated-rbac-policy.csv',
      );

      expect(await enf.hasGroupingPolicy(...newPolicy)).toBe(false);

      await loadFilteredGroupingPoliciesFromCSV(updatedPolicyFile, enf, user);

      expect(enfAddGroupingSpy).toHaveBeenCalledWith(...newPolicy);

      expect(await enf.hasGroupingPolicy(...newPolicy)).toBe(true);
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

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(true);

      await loadFilteredGroupingPoliciesFromCSV(updatedPolicyFile, enf, user);

      expect(enfRemoveGroupingSpy).toHaveBeenCalledWith(...originalPolicy);

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(false);
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

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(true);

      await loadFilteredGroupingPoliciesFromCSV(originalPolicyFile, enf, user);

      expect(enfAddGroupingSpy).toHaveBeenCalledTimes(0);
      expect(enfRemoveGroupingSpy).toHaveBeenCalledTimes(0);

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(true);
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

      expect(await enf.hasGroupingPolicy(...originalPolicy)).toBe(true);
      expect(await enf.hasGroupingPolicy(...updatedPolicy)).toBe(false);

      await expect(() =>
        loadFilteredGroupingPoliciesFromCSV(updatedPolicyFile, enf, user),
      ).rejects.toThrow(
        `Failed to validate group policy from file ${updatedPolicyFile}. Cause: Entity reference "user:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to update a policy that has changed in the file, role entityRef error', async () => {
      const newUser = 'user:default/test';
      const newPolicy = ['user:default/test', 'role:default/catalog-reader'];

      const updatedPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/role-entityref-policy.csv',
      );

      expect(await enf.hasGroupingPolicy(...newPolicy)).toBe(false);

      await expect(() =>
        loadFilteredGroupingPoliciesFromCSV(updatedPolicyFile, enf, newUser),
      ).rejects.toThrow(
        `Failed to validate group policy from file ${updatedPolicyFile}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to update a policy that has changed in the file, duplicate error', async () => {
      const duplicate = ['user:default/guest', 'role:default/catalog-deleter'];

      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-role.csv',
      );

      await expect(() =>
        loadFilteredGroupingPoliciesFromCSV(errorPolicyFile, enf, user),
      ).rejects.toThrow(
        `Duplicate grouping policy ${duplicate} found in the file ${errorPolicyFile}`,
      );
    });
  });

  describe('Loading policies from a CSV file', () => {
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
      const logger = getVoidLogger();
      enf = await createEnforcer(
        stringModel,
        adapter,
        logger,
        tokenManagerMock,
      );
    });
    it('should add policies from the CSV file', async () => {
      const test = [
        'role:default/catalog-writer',
        'catalog-entity',
        'update',
        'allow',
      ];
      await loadPoliciesFromCSV(csvPermFile, enf);

      expect(await enf.hasPolicy(...test)).toBe(true);
    });

    // Validation tests
    it('should fail to add policies from the CSV file, user entityRef group error', async () => {
      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/entityref-policy.csv',
      );

      await expect(() =>
        loadPoliciesFromCSV(errorPolicyFile, enf),
      ).rejects.toThrow(
        `Failed to validate group policy from file ${errorPolicyFile}. Cause: Entity reference "user:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to add policies from the CSV file, role entityRef group error', async () => {
      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/role-entityref-policy.csv',
      );

      await expect(() =>
        loadPoliciesFromCSV(errorPolicyFile, enf),
      ).rejects.toThrow(
        `Failed to validate group policy from file ${errorPolicyFile}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to add policies from the CSV file, role entityRef permission policy error', async () => {
      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/permission-policy.csv',
      );

      await expect(() =>
        loadPoliciesFromCSV(errorPolicyFile, enf),
      ).rejects.toThrow(
        `Failed to validate policy from file ${errorPolicyFile}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should fail to add policies from the CSV file, duplicate permission policies in CSV', async () => {
      const duplicate = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];

      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policy.csv',
      );

      await expect(() =>
        loadPoliciesFromCSV(errorPolicyFile, enf),
      ).rejects.toThrow(
        `Duplicate policy ${duplicate} found in the file ${errorPolicyFile}`,
      );
    });

    it('should fail to add policies from the CSV file, duplicate grouping policies in CSV', async () => {
      const duplicate = ['user:default/guest', 'role:default/catalog-deleter'];

      const errorPolicyFile = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-role.csv',
      );

      await expect(() =>
        loadPoliciesFromCSV(errorPolicyFile, enf),
      ).rejects.toThrow(
        `Duplicate grouping policy ${duplicate} found in the file ${errorPolicyFile}`,
      );
    });
  });
});
