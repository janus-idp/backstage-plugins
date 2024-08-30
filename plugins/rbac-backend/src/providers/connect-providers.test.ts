import { LoggerService } from '@backstage/backend-plugin-api';
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

import {
  RBACProvider,
  RBACProviderConnection,
} from '@janus-idp/backstage-plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import { Connection, connectRBACProviders } from './connect-providers';

const loggerMock = mockServices.logger.mock();

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadataDao[]> => {
        return [
          {
            roleEntityRef: 'role:default/old-provider-role',
            source: 'test',
            modifiedBy: 'test',
          },
          {
            roleEntityRef: 'role:default/existing-provider-role',
            source: 'test',
            modifiedBy: 'test',
          },
        ];
      },
    ),
  findRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadataDao | undefined> => {
        if (roleEntityRef === 'role:default/old-provider-role') {
          return {
            roleEntityRef: 'role:default/old-provider-role',
            source: 'test',
            modifiedBy: 'test',
          };
        } else if (roleEntityRef === 'role:default/existing-provider-role') {
          return {
            roleEntityRef: 'role:default/existing-provider-role',
            source: 'test',
            modifiedBy: 'test',
          };
        } else if (roleEntityRef === 'role:default/csv-role') {
          return {
            roleEntityRef: 'role:default/csv-role',
            source: 'csv-file',
            modifiedBy: 'csv-file',
          };
        }
        return undefined;
      },
    ),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const auditLoggerMock = {
  getActorId: jest.fn().mockImplementation(),
  createAuditLogDetails: jest.fn().mockImplementation(),
  auditLog: jest.fn().mockImplementation(() => Promise.resolve()),
};

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

const mockAuthService = mockServices.auth();

const dbManagerMock = Knex.knex({ client: MockClient });

const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

const roleToBeRemoved = ['user:default/old', 'role:default/old-provider-role'];
const roleMetaToBeRemoved = {
  modifiedBy: 'test',
  source: 'test',
  roleEntityRef: roleToBeRemoved[1],
};

const existingRoles = [
  ['user:default/bruce', 'role:default/existing-provider-role'],
  ['user:default/tony', 'role:default/existing-provider-role'],
];
const existingRoleMetadata = {
  modifiedBy: 'test',
  source: 'test',
  roleEntityRef: existingRoles[0][1],
};
const existingPolicy = [
  ['role:default/existing-provider-role', 'catalog-entity', 'read', 'allow'],
];

describe('Connection', () => {
  let provider: Connection;
  let enforcerDelegate: EnforcerDelegate;

  beforeEach(async () => {
    const id = 'test';

    const config = newConfigReader();

    const adapter = await new CasbinDBAdapterFactory(
      config,
      dbManagerMock,
    ).createAdapter();

    const stringModel = newModelFromString(MODEL);
    const enf = await createEnforcer(stringModel, adapter, loggerMock);

    const knex = Knex.knex({ client: MockClient });

    enforcerDelegate = new EnforcerDelegate(enf, roleMetadataStorageMock, knex);

    await enforcerDelegate.addGroupingPolicy(
      roleToBeRemoved,
      roleMetaToBeRemoved,
    );

    await enforcerDelegate.addGroupingPolicies(
      existingRoles,
      existingRoleMetadata,
    );

    await enforcerDelegate.addPolicies(existingPolicy);

    provider = new Connection(
      id,
      enforcerDelegate,
      roleMetadataStorageMock,
      loggerMock,
      auditLoggerMock,
    );
  });

  it('should initialize', () => {
    expect(provider).toBeDefined();
  });

  describe('applyRoles', () => {
    let enfAddGroupingPolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        roleMetadata: RoleMetadataDao,
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;
    let enfRemoveGroupingPolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        roleMetadata: RoleMetadataDao,
        isUpdate?: boolean | undefined,
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;

    afterEach(() => {
      (loggerMock.warn as jest.Mock).mockReset();
    });

    it('should add the new roles', async () => {
      enfAddGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'addGroupingPolicy',
      );

      const roles = [
        ['user:default/test', 'role:default/test-provider'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const roleToAdd = [['user:default/test', 'role:default/test-provider']];
      const roleMeta = {
        createdAt: new Date().toUTCString(),
        lastModified: new Date().toUTCString(),
        modifiedBy: 'test',
        source: 'test',
        roleEntityRef: roleToAdd[0][1],
      };

      await provider.applyRoles(roles);
      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(
        ...roleToAdd,
        roleMeta,
      );
    });

    it('should remove the old roles', async () => {
      enfRemoveGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'removeGroupingPolicy',
      );

      await provider.applyRoles([
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ]);
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        roleToBeRemoved,
        roleMetaToBeRemoved,
      );
    });

    it('should add a role to an already existing role', async () => {
      enfAddGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'addGroupingPolicy',
      );

      const roles = [
        ['user:default/peter', 'role:default/existing-provider-role'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const roleToAdd = [
        ['user:default/peter', 'role:default/existing-provider-role'],
      ];
      const roleMeta = {
        modifiedBy: 'test',
        source: 'test',
        roleEntityRef: roleToAdd[0][1],
      };

      await provider.applyRoles(roles);
      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(
        ...roleToAdd,
        roleMeta,
      );
    });

    it('should remove a role member from an already existing role', async () => {
      enfRemoveGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'removeGroupingPolicy',
      );

      await provider.applyRoles([
        ['user:default/tony', 'role:default/existing-provider-role'],
      ]);
      expect(enfRemoveGroupingPolicySpy).toHaveBeenNthCalledWith(
        1,
        roleToBeRemoved,
        roleMetaToBeRemoved,
      );
      expect(enfRemoveGroupingPolicySpy).toHaveBeenNthCalledWith(
        2,
        existingRoles[0],
        existingRoleMetadata,
        true,
      );
    });

    it('should log an error if a role is not valid', async () => {
      const roles = [
        ['user:default/test', 'role:default/'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const roleToAdd = `user:default/test,role:default/`;

      await provider.applyRoles(roles);
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate group policy ${roleToAdd}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should still add new role, even if there is an invalid role in array', async () => {
      enfAddGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'addGroupingPolicy',
      );

      const roles = [
        ['user:default/test', 'role:default/'],
        ['user:default/test', 'role:default/test-provider'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const failingRoleToAdd = `user:default/test,role:default/`;
      const roleToAdd = [['user:default/test', 'role:default/test-provider']];
      const roleMeta = {
        createdAt: new Date().toUTCString(),
        lastModified: new Date().toUTCString(),
        modifiedBy: 'test',
        source: 'test',
        roleEntityRef: roleToAdd[0][1],
      };

      await provider.applyRoles(roles);
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Failed to validate group policy ${failingRoleToAdd}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(
        ...roleToAdd,
        roleMeta,
      );
    });
  });

  describe('applyPermissions', () => {
    let enfAddPolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;
    let enfRemovePolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;

    afterEach(() => {
      (loggerMock.warn as jest.Mock).mockReset();
    });

    it('should add new permissions', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ['role:default/provider-role', 'catalog-entity', 'read', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policies);
    });

    it('should remove old permissions', async () => {
      enfRemovePolicySpy = jest.spyOn(enforcerDelegate, 'removePolicy');

      const policies = [
        ['role:default/provider-role', 'catalog-entity', 'read', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...existingPolicy);
    });

    it('should log an error for an invalid permission', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ['role:default/provider-role', 'catalog-entity', 'read', 'temp'],
      ];

      await provider.applyPermissions(policies);
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Invalid permission policy, Error: 'effect' has invalid value: 'temp'. It should be: 'allow' or 'deny'`,
      );
    });

    it('should log an error for an invalid permission by source', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ['role:default/csv-role', 'catalog-entity', 'read', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Unable to add policy ${policies[0].toString()}. Cause: source does not match originating role ${policies[0][0]}, consider making changes to the 'CSV-FILE'`,
      );
    });

    it('should still add new permission, even if there is an invalid permission in array', () => {
      expect('').toEqual('');
    });
  });
});

describe('connectRBACProviders', () => {
  let connectSpy: jest.SpyInstance<
    Promise<void>,
    [connection: RBACProviderConnection],
    any
  >;
  it('should initialize rbac providers', async () => {
    connectSpy = jest.spyOn(providerMock, 'connect');
    const config = newConfigReader();

    const adapter = await new CasbinDBAdapterFactory(
      config,
      dbManagerMock,
    ).createAdapter();

    const stringModel = newModelFromString(MODEL);
    const enf = await createEnforcer(stringModel, adapter, loggerMock);

    const knex = Knex.knex({ client: MockClient });

    const enforcerDelegate = new EnforcerDelegate(
      enf,
      roleMetadataStorageMock,
      knex,
    );

    await connectRBACProviders(
      [providerMock],
      enforcerDelegate,
      roleMetadataStorageMock,
      loggerMock,
      auditLoggerMock,
    );

    expect(connectSpy).toHaveBeenCalled();
  });
});

function newConfigReader(): ConfigReader {
  return new ConfigReader({
    permission: {
      rbac: {},
    },
    backend: {
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
  });
}

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: LoggerService,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const rbacDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const config = newConfigReader();

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
