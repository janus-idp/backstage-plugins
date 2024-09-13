import { getVoidLogger } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import { PolicyQueryUser } from '@backstage/plugin-permission-node';

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

import { CasbinDBAdapterFactory } from '@janus-idp/backstage-plugin-rbac-backend/src/database/casbin-adapter-factory';
import { ConditionalStorage } from '@janus-idp/backstage-plugin-rbac-backend/src/database/conditional-storage';
import { RoleMetadataStorage } from '@janus-idp/backstage-plugin-rbac-backend/src/database/role-metadata';
import { BackstageRoleManager } from '@janus-idp/backstage-plugin-rbac-backend/src/role-manager/role-manager';
import { EnforcerDelegate } from '@janus-idp/backstage-plugin-rbac-backend/src/service/enforcer-delegate';
import { MODEL } from '@janus-idp/backstage-plugin-rbac-backend/src/service/permission-model';
import { RBACPermissionPolicy } from '@janus-idp/backstage-plugin-rbac-backend/src/service/permission-policy';
import { PluginPermissionMetadataCollector } from '@janus-idp/backstage-plugin-rbac-backend/src/service/plugin-endpoints';
import { RoleMetadata } from '@janus-idp/backstage-plugin-rbac-common';

import { resolve } from 'path';

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

const conditionalStorage: ConditionalStorage = {
  filterConditions: jest.fn().mockImplementation(() => []),
  createCondition: jest.fn().mockImplementation(),
  checkConflictedConditions: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest.fn().mockImplementation(() => []),
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

const dbManagerMock = Knex.knex({ client: MockClient });
const knex = Knex.knex({ client: MockClient });
const mockAuthService = mockServices.auth();
const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };
const mockAuth = mockServices.auth();
const auditLoggerMock = {
  getActorId: jest.fn().mockImplementation(),
  createAuditLogDetails: jest.fn().mockImplementation(),
  auditLog: jest.fn().mockImplementation(),
};
const table: testcase[] = [
  // subject(user), object(workflow), action(read/use)
  // viewer
  {
    description: 'read hello_world workflow details',
    request: {
      subject: 'user:default/guest',
      object: 'orchestrator.workflows.hello_world',
      action: 'read',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'read workflow instances',
    request: {
      subject: 'user:default/guest',
      object: 'orchestrator.workflowInstance',
      action: 'read',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'execute workflow',
    request: {
      subject: 'user:default/guest',
      object: 'orchestrator.workflows.hello_world',
    },
    authResult: AuthorizeResult.DENY,
  },

  // user
  {
    description: 'read hello_world details',
    request: {
      subject: 'user:default/dan',
      object: 'orchestrator.workflows.hello_world',
      action: 'read',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'read any workflow instances',
    request: {
      subject: 'user:default/dan',
      object: 'orchestrator.workflowInstance',
      action: 'read',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'execute hello_world workflow',
    request: {
      subject: 'user:default/dan',
      object: 'orchestrator.workflows.hello_world',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'execute ansible workflow',
    request: {
      subject: 'user:default/dan',
      object: 'orchestrator.workflows.ansible-job-template',
    },
    authResult: AuthorizeResult.DENY,
  },

  // admin
  {
    description: 'read hello_world details',
    request: {
      subject: 'user:development/guest',
      object: 'orchestrator.workflows.hello_world',
      action: 'read',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'read any workflow instances',
    request: {
      subject: 'user:development/guest',
      object: 'orchestrator.workflowInstance',
      action: 'read',
    },
    authResult: AuthorizeResult.ALLOW,
  },
  {
    description: 'execute hello_world workflow',
    request: {
      subject: 'user:development/guest',
      object: 'orchestrator.workflows.hello_world',
    },
    authResult: AuthorizeResult.ALLOW,
  },
];

describe('Authorization check', () => {
  beforeEach(() => {
    roleMetadataStorageMock.updateRoleMetadata = jest.fn().mockImplementation();
  });

  describe('with viewer role', () => {
    let enfDelegate: EnforcerDelegate;
    let policy: RBACPermissionPolicy;
    const policyChecksCSV = resolve(
      __dirname,
      './__fixtures__/data/orchestrator-policy.csv',
    );

    beforeEach(async () => {
      const config = newConfigReader(policyChecksCSV);
      const adapter = await newAdapter(config);
      enfDelegate = await newEnforcerDelegate(adapter, config);
      policy = await newPermissionPolicy(config, enfDelegate);
      catalogApi.getEntities.mockReturnValue({ items: [] });
    });

    it.each(table)(
      'orchestrator policy check: $description',
      async ({ request, authResult }) => {
        console.log(
          ' aclling policy handle with ' +
            request.subject +
            ' and ' +
            request.object +
            ' and ' +
            request.action,
        );

        const result = await policy.handle(
          {
            permission: createPermission({
              name: request.object,
              attributes: { action: request.action },
            }),
          },
          userFrom(request.subject),
        );
        expect(result.result).toBe(authResult);
      },
    );
  });
});

declare class testcase {
  description: string;
  request: {
    subject: string;
    object: string;
    // undefined action is effectivly 'use' action, in the rbac-backend handling
    action?: 'create' | 'read' | 'update' | 'delete' | undefined;
  };
  authResult: AuthorizeResult;
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
        'policies-csv-file': permFile,
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
  logger: LoggerService,
  config: ConfigReader,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const rbacDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogApi,
    logger,
    catalogDBClient,
    rbacDBClient,
    config,
    mockAuthService,
  );
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

async function newEnforcerDelegate(
  adapter: Adapter,
  config: ConfigReader,
  storedPolicies?: string[][],
  storedGroupingPolicies?: string[][],
): Promise<EnforcerDelegate> {
  const theModel = newModelFromString(MODEL);
  const logger = getVoidLogger();

  const enf = await createEnforcer(theModel, adapter, logger, config);

  if (storedPolicies) {
    await enf.addPolicies(storedPolicies);
  }

  if (storedGroupingPolicies) {
    await enf.addGroupingPolicies(storedGroupingPolicies);
  }

  return new EnforcerDelegate(enf, roleMetadataStorageMock, knex);
}

async function newPermissionPolicy(
  config: ConfigReader,
  enfDelegate: EnforcerDelegate,
  roleMock?: RoleMetadataStorage,
): Promise<RBACPermissionPolicy> {
  const logger = getVoidLogger();
  const permissionPolicy = await RBACPermissionPolicy.build(
    logger,
    auditLoggerMock,
    config,
    conditionalStorage,
    enfDelegate,
    roleMock || roleMetadataStorageMock,
    knex,
    pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
    mockAuth,
  );
  auditLoggerMock.auditLog.mockReset();
  return permissionPolicy;
}

function userFrom(
  user: string,
  ownershipEntityRefs?: string[],
): PolicyQueryUser {
  return {
    identity: {
      ownershipEntityRefs: ownershipEntityRefs ?? [],
      type: 'user',
      userEntityRef: user,
    },
    credentials: {
      $$type: '@backstage/BackstageCredentials',
      principal: true,
      expiresAt: new Date('2021-01-01T00:00:00Z'),
    },
    info: {
      userEntityRef: user,
      ownershipEntityRefs: ownershipEntityRefs ?? [],
    },
    token: 'token',
  };
}
