import type { UserInfoService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import type { Adapter, Enforcer } from 'casbin';
import type { Router } from 'express';
import type TypeORMAdapter from 'typeorm-adapter';

import type {
  PluginIdProvider,
  RBACProvider,
} from '@janus-idp/backstage-plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';
import { PolicyBuilder } from './policy-builder';

const enforcerMock: Partial<Enforcer> = {
  loadPolicy: jest.fn().mockImplementation(async () => {}),
  enableAutoSave: jest.fn().mockImplementation(() => {}),
  setRoleManager: jest.fn().mockImplementation(() => {}),
  enableAutoBuildRoleLinks: jest.fn().mockImplementation(() => {}),
  buildRoleLinks: jest.fn().mockImplementation(() => {}),
};

jest.mock('casbin', () => {
  const actualCasbin = jest.requireActual('casbin');
  return {
    ...actualCasbin,
    newEnforcer: jest.fn((): Promise<Partial<Enforcer>> => {
      return Promise.resolve(enforcerMock);
    }),
    FileAdapter: jest.fn((): Adapter => {
      return {} as Adapter;
    }),
  };
});

const dataBaseAdapterFactoryMock: Partial<CasbinDBAdapterFactory> = {
  createAdapter: jest.fn((): Promise<TypeORMAdapter> => {
    return Promise.resolve({} as TypeORMAdapter);
  }),
};

jest.mock('../database/casbin-adapter-factory', () => {
  return {
    CasbinDBAdapterFactory: jest.fn((): Partial<CasbinDBAdapterFactory> => {
      return dataBaseAdapterFactoryMock;
    }),
  };
});

const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };

jest.mock('./plugin-endpoints', () => {
  return {
    PluginPermissionMetadataCollector: jest
      .fn()
      .mockImplementation(() => pluginMetadataCollectorMock),
  };
});

const mockRouter: Router = {} as Router;
const policiesServerMock: Partial<PoliciesServer> = {
  serve: jest.fn().mockImplementation(async () => {
    return mockRouter;
  }),
};

jest.mock('./policies-rest-api', () => {
  return {
    PoliciesServer: jest.fn().mockImplementation(() => policiesServerMock),
  };
});

jest.mock('./permission-policy', () => {
  return {
    RBACPermissionPolicy: {
      build: jest.fn((): Promise<RBACPermissionPolicy> => {
        return Promise.resolve({} as RBACPermissionPolicy);
      }),
    },
  };
});

const mockUserInfoService: UserInfoService = mockServices.userInfo();

const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

describe('PolicyBuilder', () => {
  const mockedAuthorize = jest.fn().mockImplementation(async () => [
    {
      result: AuthorizeResult.ALLOW,
    },
  ]);

  const mockedAuthorizeConditional = jest.fn().mockImplementation(async () => [
    {
      result: AuthorizeResult.ALLOW,
    },
  ]);

  const mockPermissionEvaluator = {
    authorize: mockedAuthorize,
    authorizeConditional: mockedAuthorizeConditional,
  };

  const mockUser = {
    type: 'User',
    userEntityRef: 'user:default/guest',
    ownershipEntityRefs: ['guest'],
  };

  const mockIdentityClient = {
    getIdentity: jest.fn().mockImplementation(async () => ({
      identity: mockUser,
    })),
  };

  const mockDiscovery = mockServices.discovery.mock();

  const backendPluginIDsProviderMock = {
    getPluginIds: jest.fn().mockImplementation(() => {
      return [];
    }),
  };

  const mockLoggerService = mockServices.logger.mock();

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should build policy server', async () => {
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: true,
              rbac: {},
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: mockUserInfoService,
      },
      backendPluginIDsProviderMock,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
  });

  it('should build policy server with rbac providers', async () => {
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: true,
              rbac: {},
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: mockUserInfoService,
      },
      backendPluginIDsProviderMock,
      [providerMock],
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();
    expect(providerMock.connect).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
  });

  it('should build policy server, but log warning that permission framework disabled', async () => {
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: false,
              rbac: {},
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: mockUserInfoService,
      },
      backendPluginIDsProviderMock,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.warn).toHaveBeenCalledWith(
      'RBAC backend plugin was disabled by application config permission.enabled: false',
    );
  });

  it('should get list plugin ids from application configuration', async () => {
    const pluginIdProvider: PluginIdProvider = { getPluginIds: () => [] };
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: true,
              rbac: {
                pluginsWithPermission: ['catalog'],
              },
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: mockUserInfoService,
      },
      pluginIdProvider,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );

    expect(pluginIdProvider.getPluginIds()).toEqual(['catalog']);
  });

  it('should merge list plugin ids from application configuration and build method', async () => {
    const pluginIdProvider: PluginIdProvider = { getPluginIds: () => ['rbac'] };
    const router = await PolicyBuilder.build(
      {
        config: mockServices.rootConfig({
          data: {
            backend: {
              database: {
                client: 'better-sqlite3',
                connection: ':memory:',
              },
            },
            permission: {
              enabled: true,
              rbac: {
                pluginsWithPermission: ['catalog'],
              },
            },
          },
        }),
        logger: mockLoggerService,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: mockUserInfoService,
      },
      pluginIdProvider,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );

    expect(pluginIdProvider.getPluginIds()).toEqual(['catalog', 'rbac']);
  });

  it('should get list plugin ids from application configuration, but provider should be created by default', async () => {
    const router = await PolicyBuilder.build({
      config: mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'better-sqlite3',
              connection: ':memory:',
            },
          },
          permission: {
            enabled: true,
            rbac: {
              pluginsWithPermission: ['catalog'],
            },
          },
        },
      }),
      logger: mockLoggerService,
      discovery: mockDiscovery,
      identity: mockIdentityClient,
      permissions: mockPermissionEvaluator,
      userInfo: mockUserInfoService,
    });
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(enforcerMock.loadPolicy).toHaveBeenCalled();
    expect(enforcerMock.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(policiesServerMock.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(mockLoggerService.info).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
    const pIdProvider = (
      PluginPermissionMetadataCollector as unknown as jest.Mock
    ).mock.calls[0][0].deps.pluginIdProvider;
    expect(pIdProvider.getPluginIds()).toEqual(['catalog']);
  });
});
