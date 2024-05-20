import { DatabaseService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';

import {
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
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
import { policyToString } from '../helper';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import { CSVFileWatcher } from './csv-file-watcher';

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

const loggerMock: any = {
  warn: jest.fn().mockImplementation(),
  debug: jest.fn().mockImplementation(),
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
        return { source: 'csv-file' };
      },
    ),
  createPolicyMetadata: jest.fn().mockImplementation(),
  removePolicyMetadata: jest.fn().mockImplementation(),
};

const dbManagerMock: DatabaseService = {
  getClient: jest.fn().mockImplementation(),
};

const mockAuthService = mockServices.auth();

const currentPermissionPolicies = [
  ['role:default/catalog-writer', 'catalog-entity', 'update', 'allow'],
  ['role:default/catalog-writer', 'catalog-entity', 'read', 'allow'],
  ['role:default/catalog-writer', 'catalog.entity.create', 'use', 'allow'],
  ['role:default/catalog-deleter', 'catalog-entity', 'delete', 'deny'],
  ['role:default/known_role', 'test.resource.deny', 'use', 'allow'],
];

const currentRoles = [
  ['user:default/guest', 'role:default/catalog-writer'],
  ['user:default/guest', 'role:default/catalog-reader'],
  ['user:default/guest', 'role:default/catalog-deleter'],
  ['user:default/known_user', 'role:default/known_role'],
];

const legacyPermission = [
  'role:default/catalog-writer',
  'catalog-entity',
  'update',
  'allow',
];

const legacyRole = ['user:default/guest', 'role:default/catalog-writer'];

describe('CSVFileWatcher', () => {
  let csvFileWatcher: CSVFileWatcher;
  let enforcerDelegate: EnforcerDelegate;
  let csvFileName: string;

  let enfAddPolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemovePolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfAddGroupingSpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemoveGroupingSpy: jest.SpyInstance<Promise<boolean>, string[], any>;

  beforeEach(async () => {
    csvFileName = resolve(
      __dirname,
      './../__fixtures__/data/valid-csv/rbac-policy.csv',
    );

    const config = newConfigReader();

    const adapter = await new CasbinDBAdapterFactory(
      config,
      dbManagerMock,
    ).createAdapter();

    const stringModel = newModelFromString(MODEL);
    const enf = await createEnforcer(stringModel, adapter, loggerMock);

    const knex = Knex.knex({ client: MockClient });

    enforcerDelegate = new EnforcerDelegate(
      enf,
      policyMetadataStorageMock,
      roleMetadataStorageMock,
      knex,
    );

    enfAddPolicySpy = jest.spyOn(enf, 'addPolicy');
    enfRemovePolicySpy = jest.spyOn(enf, 'removePolicy');
    enfAddGroupingSpy = jest.spyOn(enf, 'addGroupingPolicy');
    enfRemoveGroupingSpy = jest.spyOn(enf, 'removeGroupingPolicy');

    csvFileWatcher = new CSVFileWatcher(
      enforcerDelegate,
      loggerMock,
      roleMetadataStorageMock,
    );
  });

  afterEach(() => {
    (loggerMock.warn as jest.Mock).mockReset();
  });

  describe('initialize', () => {
    beforeEach(() => {
      policyMetadataStorageMock.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (_source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            return [];
          },
        );

      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            return { source: 'csv-file' };
          },
        );
    });

    it('should be able to add permission policies during initialization', async () => {
      await csvFileWatcher.initialize(csvFileName, false);

      const enfPolicies = await enforcerDelegate.getPolicy();

      expect(enfPolicies).toStrictEqual(currentPermissionPolicies);
    });

    it('should be able to add roles during initialization', async () => {
      await csvFileWatcher.initialize(csvFileName, false);

      const enfRoles = await enforcerDelegate.getGroupingPolicy();

      expect(enfRoles).toStrictEqual(currentRoles);
    });

    it('should be able to update legacy permission policies during initialization', async () => {
      policyMetadataStorageMock.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'legacy') {
              return [
                {
                  id: 0,
                  policy:
                    '[role:default/catalog-writer, catalog-entity, update, allow]',
                  source: 'legacy',
                },
              ];
            }
            return [];
          },
        );

      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            if (policyToString(policy) === policyToString(legacyPermission)) {
              return { source: 'legacy' };
            }
            return { source: 'csv-file' };
          },
        );

      const permissionPolicies = [
        ['role:default/catalog-writer', 'catalog-entity', 'read', 'allow'],
        [
          'role:default/catalog-writer',
          'catalog.entity.create',
          'use',
          'allow',
        ],
        ['role:default/catalog-deleter', 'catalog-entity', 'delete', 'deny'],
        ['role:default/known_role', 'test.resource.deny', 'use', 'allow'],
        ['role:default/catalog-writer', 'catalog-entity', 'update', 'allow'],
      ];

      await enforcerDelegate.addPolicy(legacyPermission, 'legacy');

      await csvFileWatcher.initialize(csvFileName, false);

      const enfPolicies = await enforcerDelegate.getPolicy();

      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...legacyPermission);

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...legacyPermission);

      expect(enfPolicies).toStrictEqual(permissionPolicies);
    });

    it('should be able to update legacy roles during initialization', async () => {
      policyMetadataStorageMock.findPolicyMetadataBySource = jest
        .fn()
        .mockImplementation(
          async (source: Source): Promise<PermissionPolicyMetadataDao[]> => {
            if (source === 'legacy') {
              return [
                {
                  id: 0,
                  policy: '[user:default/guest, role:default/catalog-writer]',
                  source: 'legacy',
                },
              ];
            }
            return [];
          },
        );

      policyMetadataStorageMock.findPolicyMetadata = jest
        .fn()
        .mockImplementation(
          async (
            policy: string[],
            _trx: Knex.Knex.Transaction,
          ): Promise<PermissionPolicyMetadata> => {
            if (policyToString(policy) === policyToString(legacyRole)) {
              return { source: 'legacy' };
            }
            return { source: 'csv-file' };
          },
        );

      const roles = [
        ['user:default/guest', 'role:default/catalog-reader'],
        ['user:default/guest', 'role:default/catalog-deleter'],
        ['user:default/known_user', 'role:default/known_role'],
        ['user:default/guest', 'role:default/catalog-writer'],
      ];

      await enforcerDelegate.addGroupingPolicy(legacyRole, {
        roleEntityRef: legacyRole[1],
        source: 'legacy',
      });

      await csvFileWatcher.initialize(csvFileName, false);

      const enfPolicies = await enforcerDelegate.getGroupingPolicy();

      expect(enfRemoveGroupingSpy).toHaveBeenCalledWith(...legacyRole);

      expect(enfAddGroupingSpy).toHaveBeenCalledWith(...legacyRole);

      expect(enfPolicies).toStrictEqual(roles);
    });

    // Failing tests
    it('should fail to add duplicate policies', async () => {
      csvFileName = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/duplicate-policy.csv',
      );

      const duplicatePolicy = [
        'role:default/catalog-writer',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const duplicateRole = [
        'user:default/guest',
        'role:default/catalog-deleter',
      ];

      const duplicatePolicyWithDifferentEffect = [
        'role:default/duplication-effect',
        'catalog-entity',
        'update',
      ];

      await csvFileWatcher.initialize(csvFileName, false);

      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        1,
        `Duplicate policy: ${duplicatePolicy} found in the file ${csvFileName}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        2,
        `Duplicate policy: ${duplicatePolicy} found in the file ${csvFileName}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        3,
        `Duplicate policy: ${duplicatePolicyWithDifferentEffect[0]}, ${duplicatePolicyWithDifferentEffect[1]}, ${duplicatePolicyWithDifferentEffect[2]} with different effect found in the file ${csvFileName}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        4,
        `Duplicate policy: ${duplicatePolicyWithDifferentEffect[0]}, ${duplicatePolicyWithDifferentEffect[1]}, ${duplicatePolicyWithDifferentEffect[2]} with different effect found in the file ${csvFileName}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        5,
        `Duplicate role: ${duplicateRole} found in the file ${csvFileName}`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        6,
        `Duplicate role: ${duplicateRole} found in the file ${csvFileName}`,
      );
    });

    it('should fail to add policies with errors', async () => {
      csvFileName = resolve(
        __dirname,
        './../__fixtures__/data/invalid-csv/error-policy.csv',
      );

      const entityRoleError = ['user:default/', 'role:default/catalog-deleter'];
      const roleError = ['user:default/test', 'role:default/'];

      const roleErrorPolicy = [
        'role:default/',
        'catalog.entity.create',
        'use',
        'allow',
      ];
      const allowErrorPolicy = [
        'role:default/test',
        'catalog.entity.create',
        'delete',
        'temp',
      ];

      await csvFileWatcher.initialize(csvFileName, false);

      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        1,
        `Failed to validate policy from file ${csvFileName}. Cause: Entity reference "${roleErrorPolicy[0]}" was not on the form [<kind>:][<namespace>/]<name>`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        2,
        `Failed to validate policy from file ${csvFileName}. Cause: 'effect' has invalid value: '${allowErrorPolicy[3]}'. It should be: 'allow' or 'deny'`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        3,
        `Failed to validate group policy ${entityRoleError} from file ${csvFileName}. Cause: Entity reference "${entityRoleError[0]}" was not on the form [<kind>:][<namespace>/]<name>`,
      );
      expect(loggerMock.warn).toHaveBeenNthCalledWith(
        4,
        `Failed to validate group policy ${roleError} from file ${csvFileName}. Cause: Entity reference "${roleError[1]}" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });
  });

  describe('onChange', () => {
    beforeEach(async () => {
      csvFileName = resolve(
        __dirname,
        './../__fixtures__/data/valid-csv/simple-policy.csv',
      );
      await csvFileWatcher.initialize(csvFileName, false);
    });

    it('should add new permission policies on change', async () => {
      const addContents = [
        ['g', 'user:default/guest', 'role:default/catalog-writer'],
        [
          'p',
          'role:default/catalog-writer',
          'catalog-entity',
          'update',
          'allow',
        ],
        [
          'p',
          'role:default/catalog-writer',
          'catalog-entity',
          'delete',
          'allow',
        ],
      ];

      const policies = [
        ['role:default/catalog-writer', 'catalog-entity', 'update', 'allow'],
        ['role:default/catalog-writer', 'catalog-entity', 'delete', 'allow'],
      ];

      csvFileWatcher.parse = jest.fn().mockImplementation(() => {
        return addContents;
      });

      await csvFileWatcher.onChange();

      const enfPolicies = await enforcerDelegate.getPolicy();

      expect(enfPolicies).toStrictEqual(policies);
    });

    it('should add new roles on change', async () => {
      const addContents = [
        ['g', 'user:default/guest', 'role:default/catalog-writer'],
        [
          'p',
          'role:default/catalog-writer',
          'catalog-entity',
          'update',
          'allow',
        ],
        ['g', 'user:default/test', 'role:default/catalog-writer'],
      ];

      const roles = [
        ['user:default/guest', 'role:default/catalog-writer'],
        ['user:default/test', 'role:default/catalog-writer'],
      ];

      csvFileWatcher.parse = jest.fn().mockImplementation(() => {
        return addContents;
      });

      await csvFileWatcher.onChange();

      const enfRoles = await enforcerDelegate.getGroupingPolicy();

      expect(enfRoles).toStrictEqual(roles);
    });

    it('should remove old permission policies on change', async () => {
      const addContents = [
        ['g', 'user:default/guest', 'role:default/catalog-writer'],
      ];

      csvFileWatcher.parse = jest.fn().mockImplementation(() => {
        return addContents;
      });

      await csvFileWatcher.onChange();

      const enfPolicies = await enforcerDelegate.getPolicy();

      expect(enfPolicies).toStrictEqual([]);
    });

    it('should remove old roles on change', async () => {
      const addContents = [
        [
          'p',
          'role:default/catalog-writer',
          'catalog-entity',
          'update',
          'allow',
        ],
      ];

      csvFileWatcher.parse = jest.fn().mockImplementation(() => {
        return addContents;
      });

      await csvFileWatcher.onChange();

      const enfRoles = await enforcerDelegate.getGroupingPolicy();

      expect(enfRoles).toStrictEqual([]);
    });

    it('should do nothing if there is no change', async () => {
      const addContents = [
        ['g', 'user:default/guest', 'role:default/catalog-writer'],
        [
          'p',
          'role:default/catalog-writer',
          'catalog-entity',
          'update',
          'allow',
        ],
      ];

      csvFileWatcher.parse = jest.fn().mockImplementation(() => {
        return addContents;
      });

      await csvFileWatcher.onChange();

      const enfRoles = await enforcerDelegate.getGroupingPolicy();
      const enfPolicies = await enforcerDelegate.getPolicy();

      expect(enfRoles).toStrictEqual([
        ['user:default/guest', 'role:default/catalog-writer'],
      ]);
      expect(enfPolicies).toStrictEqual([
        ['role:default/catalog-writer', 'catalog-entity', 'update', 'allow'],
      ]);
    });
  });
});

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  log: Logger,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const config = newConfigReader();

  const rm = new BackstageRoleManager(
    catalogApi,
    log,
    catalogDBClient,
    config,
    mockAuthService,
  );
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

function newConfigReader(
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
