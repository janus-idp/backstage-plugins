import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Adapter, Enforcer, FileAdapter } from 'casbin';
import { Router } from 'express';
import TypeORMAdapter from 'typeorm-adapter';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { RBACPermissionPolicy } from './permission-policy';
import { PolicesServer as PoliciesServer } from './policies-rest-api';
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
    PolicesServer: jest.fn().mockImplementation(() => {
      return mockPoliciesServer;
    }),
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

  const tokenManagerMock = {
    getToken: jest.fn().mockImplementation(),
    authenticate: jest.fn().mockImplementation(),
  };

  const backendPluginIDsProviderMock = {
    getPluginIds: jest.fn().mockImplementation(() => {
      return [];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should build policy server with file adapter', async () => {
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
          },
        }),
        logger: getVoidLogger(),
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        tokenManager: tokenManagerMock,
      },
      backendPluginIDsProviderMock,
    );

    expect(FileAdapter).toHaveBeenCalled();
    expect(mockEnforcer.loadPolicy).toHaveBeenCalled();
    expect(mockEnforcer.enableAutoSave).toHaveBeenCalled();
    expect(RBACPermissionPolicy.build).toHaveBeenCalled();

    expect(PoliciesServer).toHaveBeenCalled();
    expect(mockPoliciesServer.serve).toHaveBeenCalled();
    expect(router).toBeTruthy();
    expect(router).toBe(mockRouter);
  });

  it('should build policy server with database adapter', async () => {
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
              database: {
                enabled: true,
              },
            },
          },
        }),
        logger: getVoidLogger(),
        discovery: mockDiscovery,
        identity: mockIdentityClient,
        permissions: mockPermissionEvaluator,
        tokenManager: tokenManagerMock,
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
  });
});
