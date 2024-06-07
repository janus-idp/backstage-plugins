import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Adapter, Enforcer } from 'casbin';
import { Router } from 'express';
import TypeORMAdapter from 'typeorm-adapter';
import { Logger } from 'winston';

import { PluginIdProvider } from '@janus-idp/backstage-plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';
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

  const logger = getVoidLogger();
  let loggerInfoSpy: jest.SpyInstance<Logger, [infoObject: object], any>;
  let loggerWarnSpy: jest.SpyInstance<Logger, [infoObject: object], any>;

  beforeEach(async () => {
    loggerInfoSpy = jest.spyOn(logger, 'info');
    loggerWarnSpy = jest.spyOn(logger, 'warn');
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
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
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
    expect(loggerWarnSpy).toHaveBeenCalledWith(
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
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );

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
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );

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
    });
    expect(CasbinDBAdapterFactory).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
    expect(loggerInfoSpy).toHaveBeenCalledWith(
      'RBAC backend plugin was enabled',
    );
    const pIdProvider = (PoliciesServer as jest.Mock).mock.calls[0][7];
    expect(pIdProvider.getPluginIds()).toEqual(['catalog']);
  });
});
