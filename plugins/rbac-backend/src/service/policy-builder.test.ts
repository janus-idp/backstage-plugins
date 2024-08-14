import { UserInfoService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Adapter, Enforcer } from 'casbin';
import { Router } from 'express';
import TypeORMAdapter from 'typeorm-adapter';

import {
  PluginIdProvider,
  RBACProvider,
} from '@janus-idp/backstage-plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';
import { PolicyBuilder } from './policy-builder';

const mockEnforcer: Partial<Enforcer> = {
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
      return Promise.resolve(mockEnforcer);
    }),
    FileAdapter: jest.fn((): Adapter => {
      return {} as Adapter;
    }),
  };
});

const mockDataBaseAdapterFactory: Partial<CasbinDBAdapterFactory> = {
  createAdapter: jest.fn((): Promise<TypeORMAdapter> => {
    return Promise.resolve({} as TypeORMAdapter);
  }),
};

jest.mock('../database/casbin-adapter-factory', () => {
  return {
    CasbinDBAdapterFactory: jest.fn((): Partial<CasbinDBAdapterFactory> => {
      return mockDataBaseAdapterFactory;
    }),
  };
});

const mockPluginMetadataCollector: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };

jest.mock('./plugin-endpoints', () => {
  return {
    PluginPermissionMetadataCollector: jest
      .fn()
      .mockImplementation(() => mockPluginMetadataCollector),
  };
});

const mockRouter: Router = {} as Router;
const mockPoliciesServer: Partial<PoliciesServer> = {
  serve: jest.fn().mockImplementation(async () => {
    return mockRouter;
  }),
};

jest.mock('./policies-rest-api', () => {
  return {
    PoliciesServer: jest.fn().mockImplementation(() => mockPoliciesServer),
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

const userInfoServiceMock: UserInfoService = mockServices.userInfo();

const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(),
  connect: jest.fn().mockImplementation(),
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

  const mockDiscovery = {
    getBaseUrl: jest.fn(),
    getExternalBaseUrl: jest.fn(),
  };

  const backendPluginIDsProviderMock = {
    getPluginIds: jest.fn().mockImplementation(() => {
      return [];
    }),
  };

  const logger = mockServices.logger.mock();

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should build policy server', async () => {
    const router = await PolicyBuilder.build(
      {
        config: new ConfigReader({
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
        }),
        logger,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: userInfoServiceMock,
      },
      backendPluginIDsProviderMock,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(logger.info).toHaveBeenCalledWith('RBAC backend plugin was enabled');
  });

  it('should build policy server with rbac providers', async () => {
    const router = await PolicyBuilder.build(
      {
        config: new ConfigReader({
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
        }),
        logger,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: userInfoServiceMock,
      },
      backendPluginIDsProviderMock,
      [providerMock],
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();
    expect(providerMock.connect).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(logger.info).toHaveBeenCalledWith('RBAC backend plugin was enabled');
  });

  it('should build policy server, but log warning that permission framework disabled', async () => {
    const router = await PolicyBuilder.build(
      {
        config: new ConfigReader({
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
        }),
        logger,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: userInfoServiceMock,
      },
      backendPluginIDsProviderMock,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(logger.warn).toHaveBeenCalledWith(
      'RBAC backend plugin was disabled by application config permission.enabled: false',
    );
  });

  it('should get list plugin ids from application configuration', async () => {
    const pluginIdProvider: PluginIdProvider = { getPluginIds: () => [] };
    const router = await PolicyBuilder.build(
      {
        config: new ConfigReader({
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
        }),
        logger,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: userInfoServiceMock,
      },
      pluginIdProvider,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(logger.info).toHaveBeenCalledWith('RBAC backend plugin was enabled');

    expect(pluginIdProvider.getPluginIds()).toEqual(['catalog']);
  });

  it('should merge list plugin ids from application configuration and build method', async () => {
    const pluginIdProvider: PluginIdProvider = { getPluginIds: () => ['rbac'] };
    const router = await PolicyBuilder.build(
      {
        config: new ConfigReader({
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
        }),
        logger,
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        userInfo: userInfoServiceMock,
      },
      pluginIdProvider,
    );
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(logger.info).toHaveBeenCalledWith('RBAC backend plugin was enabled');

    expect(pluginIdProvider.getPluginIds()).toEqual(['catalog', 'rbac']);
  });

  it('should get list plugin ids from application configuration, but provider should be created by default', async () => {
    const router = await PolicyBuilder.build({
      config: new ConfigReader({
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
      }),
      logger,
      discovery: mockDiscovery,
      identity: mockIdentityClient,
      permissions: mockPermissionEvaluator,
      userInfo: userInfoServiceMock,
    });
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(logger.info).toHaveBeenCalledWith('RBAC backend plugin was enabled');
    const pIdProvider = (
      PluginPermissionMetadataCollector as unknown as jest.Mock
    ).mock.calls[0][1];
    expect(pIdProvider.getPluginIds()).toEqual(['catalog']);
  });
});
