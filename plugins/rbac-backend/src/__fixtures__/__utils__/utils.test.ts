import { getVoidLogger, TokenManager } from '@backstage/backend-common';
import { DatabaseService } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';

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

import { CasbinDBAdapterFactory } from '../../database/casbin-adapter-factory';
import { ConditionalStorage } from '../../database/conditional-storage';
import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../../database/policy-metadata-storage';
import { RoleMetadataStorage } from '../../database/role-metadata';
import { BackstageRoleManager } from '../../role-manager/role-manager';
import { EnforcerDelegate } from '../../service/enforcer-delegate';
import { MODEL } from '../../service/permission-model';
import { RBACPermissionPolicy } from '../../service/permission-policy';

const csvPermFile = resolve(
  __dirname,
  './../__fixtures__/data/valid-csv/rbac-policy.csv',
);

const knex = Knex.knex({ client: MockClient });

export const catalogApiMock = {
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

export const roleMetadataStorageMock: RoleMetadataStorage = {
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

export const policyMetadataStorageMock: PolicyMetadataStorage = {
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

export const conditionalStorageMock: ConditionalStorage = {
  filterConditions: jest.fn().mockImplementation(() => []),
  createCondition: jest.fn().mockImplementation(),
  findUniqueCondition: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

export const tokenManagerMock = {
  getToken: jest.fn().mockImplementation(async () => {
    return Promise.resolve({ token: 'some-token' });
  }),
  authenticate: jest.fn().mockImplementation(),
};

export const dbManagerMock: DatabaseService = {
  getClient: jest.fn().mockImplementation(),
};

export const loggerMock: any = {
  warn: jest.fn().mockImplementation(),
  debug: jest.fn().mockImplementation(),
};

export function newConfigReader(
  permFile?: string,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
  cached?: boolean,
): ConfigReader {
  let cache;

  const testUsers = [
    {
      name: 'user:default/guest',
    },
    {
      name: 'group:default/guests',
    },
  ];

  if (cached) {
    cache = {
      maxSize: 5,
      expiration: 1000,
    };
  }

  return new ConfigReader({
    permission: {
      rbac: {
        'policies-csv-file': permFile || csvPermFile,
        policyFileReload: true,
        admin: {
          users: users || testUsers,
          superUsers: superUsers,
        },
        cache,
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

export async function newAdapter(
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

export async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: Logger,
  tokenManager: TokenManager,
  config?: ConfigReader,
): Promise<Enforcer> {
  const configRead = config || new ConfigReader({});
  const catalogDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogApiMock,
    logger,
    tokenManager,
    catalogDBClient,
    configRead,
  );
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

export async function newEnforcerDelegate(
  adapter: Adapter,
  config: ConfigReader,
  storedPolicies?: string[][],
  storedGroupingPolicies?: string[][],
  policyMock?: PolicyMetadataStorage,
  roleMock?: RoleMetadataStorage,
): Promise<EnforcerDelegate> {
  const theModel = newModelFromString(MODEL);
  const logger = getVoidLogger();

  const enf = await createEnforcer(
    theModel,
    adapter,
    logger,
    tokenManagerMock,
    config,
  );

  if (storedPolicies) {
    await enf.addPolicies(storedPolicies);
  }

  if (storedGroupingPolicies) {
    await enf.addGroupingPolicies(storedGroupingPolicies);
  }

  return new EnforcerDelegate(
    enf,
    policyMock || policyMetadataStorageMock,
    roleMock || roleMetadataStorageMock,
    knex,
  );
}

export async function newPermissionPolicy(
  config: ConfigReader,
  enfDelegate: EnforcerDelegate,
  roleMock?: RoleMetadataStorage,
  policyMock?: PolicyMetadataStorage,
  conMock?: ConditionalStorage,
): Promise<RBACPermissionPolicy> {
  const logger = getVoidLogger();
  return await RBACPermissionPolicy.build(
    logger,
    config,
    conMock || conditionalStorageMock,
    enfDelegate,
    roleMock || roleMetadataStorageMock,
    policyMock || policyMetadataStorageMock,
    knex,
  );
}
