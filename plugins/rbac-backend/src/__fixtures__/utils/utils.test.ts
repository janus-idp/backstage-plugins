import { getVoidLogger } from '@backstage/backend-common';
import { DatabaseService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

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

export const csvPermFile = resolve(
  __dirname,
  './../data/valid-csv/rbac-policy.csv',
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
        return Promise.resolve({ source: 'csv-file' });
      },
    ),
  createPolicyMetadata: jest.fn().mockImplementation(),
  removePolicyMetadata: jest.fn().mockImplementation(),
};

export const conditionalStorageMock = {
  filterConditions: jest.fn().mockImplementation(() => []),
  createCondition: jest.fn().mockImplementation(),
  findUniqueCondition: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

export const dbManagerMock: DatabaseService = {
  getClient: jest.fn().mockImplementation(),
};

export const loggerMock: any = {
  warn: jest.fn().mockImplementation(),
  debug: jest.fn().mockImplementation(),
};

export const mockedAuthorize = jest.fn().mockImplementation(async () => [
  {
    result: AuthorizeResult.ALLOW,
  },
]);

export const mockedAuthorizeConditional = jest
  .fn()
  .mockImplementation(async () => [
    {
      result: AuthorizeResult.ALLOW,
    },
  ]);

export const mockPermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: mockedAuthorizeConditional,
};

export const mockHttpAuth = mockServices.httpAuth();
export const mockAuth = mockServices.auth();

export function newConfigReader(
  permFile?: string,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
  maxDepth?: number,
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
        maxDepth,
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
  fileName?: string,
): Promise<Adapter> {
  if (stringPolicy) {
    return new StringAdapter(stringPolicy);
  }
  if (fileName) {
    return new FileAdapter(fileName);
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
  config?: ConfigReader,
): Promise<Enforcer> {
  const configRead = config || new ConfigReader({});
  const catalogDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogApiMock,
    logger,
    catalogDBClient,
    configRead,
    mockAuth,
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
  enf?: Enforcer,
): Promise<EnforcerDelegate> {
  const theModel = newModelFromString(MODEL);
  const logger = getVoidLogger();

  const enforcer =
    enf || (await createEnforcer(theModel, adapter, logger, config));

  if (storedPolicies) {
    await enforcer.addPolicies(storedPolicies);
  }

  if (storedGroupingPolicies) {
    await enforcer.addGroupingPolicies(storedGroupingPolicies);
  }

  return new EnforcerDelegate(
    enforcer,
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

export function createGroupEntity(
  name: string,
  parent?: string,
  children?: string[],
  members?: string[],
): Entity {
  const entity: Entity = {
    apiVersion: 'v1',
    kind: 'Group',
    metadata: {
      name,
      namespace: 'default',
    },
    spec: {},
  };

  if (children) {
    entity.spec!.children = children;
  }

  if (members) {
    entity.spec!.members = members;
  }

  if (parent) {
    entity.spec!.parent = parent;
  }

  return entity;
}
