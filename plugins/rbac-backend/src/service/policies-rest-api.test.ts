import { errorHandler, getVoidLogger } from '@backstage/backend-common';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { ConfigReader } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { RouterOptions } from '@backstage/plugin-permission-backend';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { MetadataResponse } from '@backstage/plugin-permission-node';

import express from 'express';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import request from 'supertest';

import {
  PermissionAction,
  PermissionInfo,
  PermissionPolicyMetadata,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  Role,
  RoleConditionalPolicyDecision,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { PolicyMetadataStorage } from '../database/policy-metadata-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { EnforcerDelegate } from './enforcer-delegate';
import { RBACPermissionPolicy } from './permission-policy';
import {
  PluginMetadataResponseSerializedRule,
  PluginPermissionMetaData,
  PluginPermissionMetadataCollector,
} from './plugin-endpoints';
import { PoliciesServer } from './policies-rest-api';

const pluginPermissionMetadataCollectorMock = {
  getPluginPolicies: jest.fn().mockImplementation(),
  getPluginConditionRules: jest.fn().mockImplementation(),
  getMetadataByPluginId: jest.fn().mockImplementation(),
};

jest.mock('./plugin-endpoints', () => {
  return {
    PluginPermissionMetadataCollector: jest.fn(
      (): Partial<PluginPermissionMetadataCollector> => {
        return pluginPermissionMetadataCollectorMock;
      },
    ),
  };
});

jest.mock('@backstage/plugin-auth-node', () => ({
  getBearerTokenFromAuthorizationHeader: () => 'token',
}));

const mockEnforcer: Partial<EnforcerDelegate> = {
  hasPolicy: jest
    .fn()
    .mockImplementation(async (..._param: string[]): Promise<boolean> => {
      return false;
    }),

  hasGroupingPolicy: jest
    .fn()
    .mockImplementation(async (..._param: string[]): Promise<boolean> => {
      return false;
    }),

  getPolicy: jest.fn().mockImplementation((): Promise<string[][]> => {
    return Promise.resolve([[]]);
  }),

  getGroupingPolicy: jest.fn().mockImplementation((): Promise<string[][]> => {
    return Promise.resolve([[]]);
  }),

  getFilteredPolicy: jest
    .fn()
    .mockImplementation(
      async (_fieldIndex: number, ..._fieldValues: string[]) => {
        return [
          ['user:default/permission_admin', 'policy-entity', 'create', 'allow'],
        ];
      },
    ),
  getFilteredGroupingPolicy: jest
    .fn()
    .mockImplementation(
      async (_fieldIndex: number, ..._fieldValues: string[]) => {
        return [['user:default/permission_admin', 'role:default/rbac_admin']];
      },
    ),

  addPolicy: jest.fn().mockImplementation(),

  addOrUpdatePolicy: jest.fn().mockImplementation(),

  addPolicies: jest.fn().mockImplementation(),

  addOrUpdateGroupingPolicies: jest.fn().mockImplementation(),

  addGroupingPolicies: jest.fn().mockImplementation(),

  removePolicy: jest.fn().mockImplementation(),

  removePolicies: jest.fn().mockImplementation(),

  removeGroupingPolicy: jest.fn().mockImplementation(),

  removeGroupingPolicies: jest.fn().mockImplementation(),

  getMetadata: jest.fn().mockImplementation(async () => {
    const metadata: PermissionPolicyMetadata = { source: 'rest' };
    return Promise.resolve(metadata);
  }),

  getFilteredPolicyMetadata: jest.fn().mockImplementation(() => {
    return [];
  }),

  hasFilteredPolicyMetadata: jest.fn().mockImplementation(() => {
    return Promise.resolve(false);
  }),

  updatePolicies: jest.fn().mockImplementation(),

  updateGroupingPolicies: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const policyMetadataStorageMock: PolicyMetadataStorage = {
  findPolicyMetadataBySource: jest.fn().mockImplementation(),
  findPolicyMetadata: jest.fn().mockImplementation(),
  createPolicyMetadata: jest.fn().mockImplementation(),
  removePolicyMetadata: jest.fn().mockImplementation(),
};

const conditionalStorage = {
  filterConditions: jest.fn().mockImplementation(),
  createCondition: jest.fn().mockImplementation(),
  findUniqueCondition: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

const validateRoleConditionMock = jest.fn().mockImplementation();
jest.mock('./condition-validation', () => {
  return {
    validateRoleCondition: jest
      .fn()
      .mockImplementation(
        (condition: RoleConditionalPolicyDecision<PermissionAction>) => {
          validateRoleConditionMock(condition);
        },
      ),
  };
});

const mockHttpAuth = mockServices.httpAuth();
const mockAuth = mockServices.auth();
const credentials = mockCredentials.user();

const conditions: RoleConditionalPolicyDecision<PermissionInfo>[] = [
  {
    id: 1,
    pluginId: 'catalog',
    roleEntityRef: 'role:default/test',
    resourceType: 'catalog-entity',
    permissionMapping: [{ name: 'catalog.entity.read', action: 'read' }],
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: { claims: ['group:default/team-a'] },
    },
  },
];

const expectedConditions: RoleConditionalPolicyDecision<PermissionAction>[] = [
  {
    id: 1,
    pluginId: 'catalog',
    roleEntityRef: 'role:default/test',
    resourceType: 'catalog-entity',
    permissionMapping: ['read'],
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: { claims: ['group:default/team-a'] },
    },
  },
];

describe('REST policies api', () => {
  let app: express.Express;

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

  const mockIdentityClient = {
    getIdentity: jest.fn().mockImplementation(async () => ({
      identity: {
        type: 'User',
        userEntityRef: 'user:default/guest',
        ownershipEntityRefs: ['guest'],
      },
    })),
  };

  const backendPluginIDsProviderMock = {
    getPluginIds: jest.fn().mockImplementation(() => {
      return [];
    }),
  };

  const logger = getVoidLogger();
  const mockDiscovery = {
    getBaseUrl: jest.fn().mockImplementation(),
    getExternalBaseUrl: jest.fn().mockImplementation(),
  };

  const knex = Knex.knex({ client: MockClient });

  let config = new ConfigReader({
    backend: {
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
    permission: {
      enabled: true,
    },
  });

  let server: PoliciesServer;

  beforeEach(async () => {
    conditionalStorage.filterConditions = jest
      .fn()
      .mockImplementation(async () => {
        return conditions;
      });

    mockEnforcer.hasPolicy = jest
      .fn()
      .mockImplementation(async (..._param: string[]): Promise<boolean> => {
        return false;
      });
    mockEnforcer.hasGroupingPolicy = jest
      .fn()
      .mockImplementation(async (..._param: string[]): Promise<boolean> => {
        return false;
      });

    roleMetadataStorageMock.findRoleMetadata = jest
      .fn()
      .mockImplementation(
        async (roleEntityRef: string): Promise<RoleMetadataDao> => {
          return { source: 'rest', roleEntityRef: roleEntityRef };
        },
      );

    const options: RouterOptions = {
      config: config,
      logger,
      discovery: mockDiscovery,
      identity: mockIdentityClient,
      policy: await RBACPermissionPolicy.build(
        logger,
        config,
        conditionalStorage,
        mockEnforcer as EnforcerDelegate,
        roleMetadataStorageMock,
        policyMetadataStorageMock,
        knex,
      ),
    };

    server = new PoliciesServer(
      mockPermissionEvaluator,
      options,
      mockEnforcer as EnforcerDelegate,
      config,
      mockHttpAuth,
      mockAuth,
      conditionalStorage,
      backendPluginIDsProviderMock,
      roleMetadataStorageMock,
    );
    const router = await server.serve();
    app = express().use(router);
    app.use(errorHandler());
    conditionalStorage.getCondition.mockReset();
    validateRoleConditionMock.mockReset();
    jest.clearAllMocks();
  });

  it('should build', () => {
    expect(app).toBeTruthy();
  });

  describe('GET /', () => {
    it('should return a status of Authorized', async () => {
      const result = await request(app).get('/').send();

      expect(result.status).toBe(200);
      expect(result.body).toEqual({ status: 'Authorized' });
    });

    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });
  });

  describe('POST /policies', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).post('/policies').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return a status of Unauthorized - no user', async () => {
      mockIdentityClient.getIdentity.mockImplementationOnce(() => undefined);
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: 'User not found',
      });
    });

    it('should not be created permission policy - req body is an empty', async () => {
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `permission policy must be present`,
      });
    });

    it('should not be created permission policy - entityReference is empty', async () => {
      const result = await request(app).post('/policies').send([{}]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'entityReference' must not be empty`,
      });
    });

    it('should not be created permission policy - entityReference is invalid', async () => {
      const result = await request(app)
        .post('/policies')
        .send([{ entityReference: 'user' }]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: Entity reference "user" had missing or empty kind (e.g. did not start with "component:" or similar)`,
      });
    });

    it('should not be created permission policy - permission is an empty', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
          },
        ]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should not be created permission policy - policy is an empty', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
          },
        ]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should not be created permission policy - effect is an empty', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'read',
          },
        ]);

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should be created permission policy', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(201);
    });

    it('should not be created permission policy, because it is has been already present', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param.at(2) === 'read') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'read',
            effect: 'deny',
          },
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(409);
    });

    it('should not be created permission policy caused some unexpected error', async () => {
      mockEnforcer.addPolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error(`Failed to add policies`);
        });

      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(500);
    });

    it('should fail to create permission policy - duplication in req body', async () => {
      const result = await request(app)
        .post('/policies')
        .send([
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
          {
            entityReference: 'user:default/permission_admin',
            permission: 'policy-entity',
            policy: 'delete',
            effect: 'deny',
          },
        ]);

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate polices found; user:default/permission_admin, policy-entity, delete, deny is a duplicate`,
      });
    });
  });

  describe('GET /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be returned permission policies by user reference', async () => {
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'user:default/permission_admin',
          permission: 'policy-entity',
          policy: 'create',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
    it('should be returned policies by user reference not found', async () => {
      mockEnforcer.getFilteredPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [];
          },
        );

      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { message: '', name: 'NotFoundError' },
        request: {
          method: 'GET',
          url: '/policies/user/default/permission_admin',
        },
        response: { statusCode: 404 },
      });
    });
  });

  describe('GET /policies', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/policies').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be returned list all policies', async () => {
      mockEnforcer.getPolicy = jest.fn().mockImplementation(async () => {
        return [
          ['user:default/permission_admin', 'policy-entity', 'create', 'allow'],
          ['user:default/guest', 'policy-entity', 'read', 'allow'],
        ];
      });
      const result = await request(app).get('/policies').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'user:default/permission_admin',
          permission: 'policy-entity',
          policy: 'create',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
        {
          entityReference: 'user:default/guest',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
    it('should be returned list filtered policies', async () => {
      mockEnforcer.getFilteredPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [['user:default/guest', 'policy-entity', 'read', 'allow']];
          },
        );
      const result = await request(app)
        .get(
          '/policies?entityRef=user:default/guest&permission=policy-entity&policy=read&effect=allow',
        )
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          entityReference: 'user:default/guest',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
  });

  describe('DELETE /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityDeletePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should fail to delete, request is empty', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `permission policy must be present`,
      });
    });

    it('should fail to delete, because permission field is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([{}]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to delete, because policy field is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
          },
        ]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to delete, because effect field is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
          },
        ]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to delete, because policy not found', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Policy '[user:default/permission_admin, policy-entity, read, allow]' not found`,
      });
    });

    it('should fail to delete, because unexpected error', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<void> => {
          throw new Error('Fail to delete policy');
        });

      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to delete policy',
      });
    });

    it('should delete policy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toEqual(204);
    });
  });

  describe('PUT /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should fail to update policy - old policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send([{}]);

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldPolicy' object must be present`,
      });
    });

    it('should fail to update policy - new policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: [{}] });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'newPolicy' object must be present`,
      });
    });

    it('should fail to update policy - oldPolicy permission is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: [{}], newPolicy: [{}] });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to update policy - oldPolicy policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [{ permission: 'policy-entity' }],
          newPolicy: [{}],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to update policy - oldPolicy effect is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [{ permission: 'policy-entity', policy: 'read' }],
          newPolicy: [{}],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy permission is absent', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [{}],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy policy is absent', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [{ permission: 'policy-entity' }],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy effect is absent', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [{ permission: 'policy-entity', policy: 'write' }],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy effect has invalid value', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'unknown',
            },
          ],
          newPolicy: [{ permission: 'policy-entity', policy: 'write' }],
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy definition. Cause: 'effect' has invalid value: 'unknown'. It should be: '${AuthorizeResult.ALLOW.toLocaleLowerCase()}' or '${AuthorizeResult.DENY.toLocaleLowerCase()}'`,
      });
    });

    it('should fail to update policy - old policy not found', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Policy '[user:default/permission_admin, policy-entity, read, allow]' not found`,
      });
    });

    it('should fail to update policy - old policy not found but old and new policies match', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Policy '[user:default/permission_admin, policy-entity, read, allow]' not found`,
      });
    });

    it('should fail to update policy - newPolicy is already present', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Policy '[user:default/permission_admin, policy-entity, write, allow]' has been already stored`,
      });
    });

    it('should nothing to update', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update - same permissions with different policy in a different order', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update - same permissions with different permission type in a different order', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'catalog-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'catalog-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should fail to update policy - unable to remove oldPolicy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'write') {
            return false;
          }
          return true;
        });
      mockEnforcer.updatePolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error('Fail to remove policy');
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to remove policy',
      });
    });

    it('should fail to update policy - unable to add newPolicy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'write') {
            return false;
          }
          return true;
        });
      mockEnforcer.updatePolicies = jest
        .fn()
        .mockImplementation(
          async (_param: string[][], _source: Source): Promise<void> => {
            throw new Error('Fail to add policy');
          },
        );

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to add policy',
      });
    });

    it('should update policy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'write') {
            return false;
          }
          return true;
        });
      mockEnforcer.updatePolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should fail to update permission policy - duplication in old policy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'write') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate polices found; user:default/permission_admin, policy-entity, read, allow is a duplicate`,
      });
    });

    it('should fail to update permission policy - duplication in new policy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'write') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'write',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate polices found; user:default/permission_admin, policy-entity, write, allow is a duplicate`,
      });
    });

    it('should fail to update permission policy - oldPolicy has an additional permission', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
            {
              permission: 'policy-entity',
              policy: 'create',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'delete',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldPolicy' object has more permission policies compared to 'newPolicy' object`,
      });
    });
  });

  describe('GET /roles', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/roles').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be returned list all roles', async () => {
      mockEnforcer.getGroupingPolicy = jest
        .fn()
        .mockImplementation(async () => {
          return [
            ['group:default/test', 'role:default/test'],
            ['group:default/team_a', 'role:default/team_a'],
          ];
        });
      const result = await request(app).get('/roles').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          memberReferences: ['group:default/test'],
          name: 'role:default/test',
          metadata: {
            source: 'rest',
          },
        },
        {
          memberReferences: ['group:default/team_a'],
          name: 'role:default/team_a',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });
  });

  describe('GET /roles/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return an input error when kind is wrong', async () => {
      const result = await request(app)
        .get('/roles/test/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Unsupported kind test. Supported value should be "role"`,
      });
    });

    it('should be returned role by role reference', async () => {
      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([
        {
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
          metadata: {
            source: 'rest',
          },
        },
      ]);
    });

    it('should be returned not found error by role reference', async () => {
      mockEnforcer.getFilteredGroupingPolicy = jest
        .fn()
        .mockImplementation(
          async (_fieldIndex: number, ..._fieldValues: string[]) => {
            return [];
          },
        );

      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body).toEqual({
        error: { message: '', name: 'NotFoundError' },
        request: {
          method: 'GET',
          url: '/roles/role/default/rbac_admin',
        },
        response: { statusCode: 404 },
      });
    });
  });

  describe('POST /roles', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).post('/roles').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should not be created role - req body is an empty', async () => {
      const result = await request(app).post('/roles').send();

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'name' field must not be empty`,
      });
    });

    it('should not be created role - memberReferences is missing', async () => {
      const result = await request(app).post('/roles').send({
        name: 'role:default/test',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'memberReferences' field must not be empty`,
      });
    });

    it('should not be created role - memberReferences is empty', async () => {
      const result = await request(app).post('/roles').send({
        memberReferences: [],
        name: 'role:default/test',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'memberReferences' field must not be empty`,
      });
    });

    it('should not be created role - memberReferences is invalid', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user'],
          name: 'role:default/test',
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: Entity reference "user" had missing or empty kind (e.g. did not start with "component:" or similar)`,
      });
    });

    it('should not be created role - name is empty', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: 'name' field must not be empty`,
      });
    });

    it('should not create a role - name is invalid', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'x:default/rbac_admin',
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid role definition. Cause: Unsupported kind x. Supported value should be "role"`,
      });
    });

    it('should be created role', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(201);
      expect(mockEnforcer.addGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        {
          author: 'user:default/guest',
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
          description: '',
          modifiedBy: 'user:default/guest',
        },
      );
    });

    it('should be created role with description', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
          metadata: {
            description: 'some test description',
          },
        });

      expect(result.statusCode).toBe(201);
      expect(mockEnforcer.addGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        {
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
          author: 'user:default/guest',
          description: 'some test description',
          modifiedBy: 'user:default/guest',
        },
      );
    });

    it('should not be created role, because it is has been already present', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(409);
    });

    it('should not be created role caused some unexpected error', async () => {
      mockEnforcer.addGroupingPolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error('Fail to create new policy');
        });

      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Fail to create new policy',
      });
    });

    it('should fail to create role - duplicate', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: [
            'user:default/permission_admin',
            'user:default/permission_admin',
          ],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate role members found; user:default/permission_admin, role:default/rbac_admin is a duplicate`,
      });
    });
  });

  describe('PUT /roles/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should fail to update role - old role is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldRole' object must be present`,
      });
    });

    it('should fail to update role - new role is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({ oldRole: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'newRole' object must be present`,
      });
    });

    it('should fail to update role - oldRole entity is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({ oldRole: {}, newRole: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old role object. Cause: 'memberReferences' field must not be empty`,
      });
    });

    it('should fail to update role - newRole entity is absent', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: { memberReferences: ['user:default/permission_admin'] },
          newRole: {},
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new role object. Cause: 'name' field must not be empty`,
      });
    });

    it('should fail to update role - old role not found', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._policy: string[]): Promise<boolean> => {
          return false;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message:
          'Member reference: user:default/permission_admin was not found for role role:default/rbac_admin',
      });
    });

    it('should fail to update role - newRole is already present', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: '',
      });
    });

    it('should nothing to update', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update, because role and metadata are the same', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
            metadata: {
              source: 'rest',
            },
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
            },
          },
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should nothing to update, because role and metadata are the same, but old role metadata was not send', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
            },
          },
        });

      expect(result.statusCode).toEqual(204);
    });

    it('should update description and set author', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/permission_admin'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
            },
          },
        });

      expect(result.statusCode).toEqual(200);
      expect(mockEnforcer.updateGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        {
          description: 'some admin role.',
          modifiedBy: 'user:default/guest',
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
        },
        false,
      );
    });

    it('should update role and role description', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/permission_admin') {
            return true;
          }
          return false;
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/dev'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
            },
          },
        });

      expect(result.statusCode).toEqual(200);

      expect(mockEnforcer.updateGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/permission_admin', 'role:default/rbac_admin']],
        [
          ['user:default/test', 'role:default/rbac_admin'],
          ['user:default/dev', 'role:default/rbac_admin'],
        ],
        {
          description: 'some admin role.',
          modifiedBy: 'user:default/guest',
          roleEntityRef: 'role:default/rbac_admin',
          source: 'rest',
        },
        false,
      );
    });

    it('should fail to update policy - role metadata could not be found', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<undefined> => {
          return undefined;
        });
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: `Unable to find metadata for role:default/rbac_admin`,
      });
    });

    it('should fail to update role - unable to remove oldRole', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      mockEnforcer.updateGroupingPolicies = jest
        .fn()
        .mockImplementation(async (): Promise<void> => {
          throw new Error('Unexpected error');
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should fail to update role - unable to add newRole', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      mockEnforcer.updateGroupingPolicies = jest
        .fn()
        .mockImplementation(
          async (_param: string[][], _source: Source): Promise<void> => {
            throw new Error('Unexpected error');
          },
        );

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should update role', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      mockEnforcer.updateGroupingPolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role where newRole has multiple roles', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (
            param[0] === 'user:default/test' ||
            param[0] === 'user:default/test2'
          ) {
            return false;
          }
          return true;
        });
      mockEnforcer.updateGroupingPolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/test2'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role where newRole has multiple roles with one being from oldRole', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      mockEnforcer.updateGroupingPolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: [
              'user:default/permission_admin',
              'user:default/test',
            ],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should update role name', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });
      mockEnforcer.updateGroupingPolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/test',
          },
        });

      expect(result.statusCode).toEqual(200);
    });

    it('should fail to update role - duplicate roles in oldRole', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/test') {
            return false;
          }
          return true;
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: [
              'user:default/permission_admin',
              'user:default/permission_admin',
            ],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate role members found; user:default/permission_admin, role:default/rbac_admin is a duplicate`,
      });
    });

    it('should fail to update role - duplicate roles in newRole', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/test'],
            name: 'role:default/rbac_admin',
          },
        });

      expect(result.statusCode).toBe(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: `Duplicate role members found; user:default/test, role:default/rbac_admin is a duplicate`,
      });
    });

    it('should fail to update role name when role name is invalid', async () => {
      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/',
          },
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new role object. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      });
    });

    it('should fail to update - oldRole name is invalid', async () => {
      const result = await request(app)
        .put('/roles/x/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test'],
            name: 'role:default/',
          },
        });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Unsupported kind x. Supported value should be "role"`,
      });
    });
  });

  describe('DELETE /roles/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityDeletePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should fail to delete, because unexpected error', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(
          async (_param: string[][], _source: Source): Promise<void> => {
            throw new Error('Unexpected error');
          },
        );

      const result = await request(app)
        .delete(
          '/roles/role/default/rbac_admin?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should fail to delete, because not found error', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .delete(
          '/roles/role/default/rbac_admin?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: '',
      });
    });

    it('should delete a user / group from a role', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete(
          '/roles/role/default/rbac_admin?memberReferences=group:default/test',
        )
        .send();

      expect(result.statusCode).toEqual(204);
    });

    it('should delete a role', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toEqual(204);
    });
  });

  describe('GetFirstQuery', () => {
    it('should return an empty string for undefined query value', () => {
      const result = server.getFirstQuery(undefined);
      expect(result).toBe('');
    });

    it('should return the first string value from a string array', async () => {
      const queryValue = ['value1', 'value2'];
      const result = server.getFirstQuery(queryValue);
      expect(result).toBe('value1');
    });

    it('should throw an InputError for an array of ParsedQs', () => {
      const queryValue = [{ key: 'value' }, { key: 'value2' }];
      expect(() => server.getFirstQuery(queryValue)).toThrow(InputError);
    });

    it('should return the string value when query value is a string', () => {
      const queryValue = 'singleValue';
      const result = server.getFirstQuery(queryValue);
      expect(result).toBe('singleValue');
    });

    it('should throw an InputError for ParsedQs', () => {
      const queryValue = { key: 'value' };
      expect(() => server.getFirstQuery(queryValue)).toThrow(InputError);
    });
  });

  describe('transformRoleArray', () => {
    it('should combine two roles together that are similar', async () => {
      const roles = [
        ['group:default/test', 'role:default/test'],
        ['user:default/test', 'role:default/test'],
      ];

      const expectedResult: Role[] = [
        {
          memberReferences: ['group:default/test', 'user:default/test'],
          name: 'role:default/test',
          metadata: {
            author: undefined,
            createdAt: undefined,
            description: undefined,
            lastModified: undefined,
            modifiedBy: undefined,
            source: 'rest',
          },
        },
      ];

      const transformedRoles = await server.transformRoleArray(...roles);
      expect(transformedRoles).toStrictEqual(expectedResult);
    });
  });

  // Define a test suite for the GET /conditions endpoint
  describe('GET /roles/conditions', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      // Perform the GET request to the endpoint
      const result = await request(app).get('/roles/conditions').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be returned list all condition decisions', async () => {
      const result = await request(app).get('/roles/conditions').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
      expect(mockIdentityClient.getIdentity).toHaveBeenCalledTimes(0);
    });

    it('should be returned condition decision by pluginId', async () => {
      conditionalStorage.filterConditions = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            pluginId: string,
            _resourceType: string,
          ) => {
            if (pluginId === 'catalog') {
              return conditions;
            }
            return [];
          },
        );
      const result = await request(app)
        .get('/roles/conditions?pluginId=catalog')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
    });

    it('should be returned empty condition decision list by pluginId', async () => {
      conditionalStorage.filterConditions = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            pluginId: string,
            _resourceType: string,
          ) => {
            if (pluginId === 'catalog') {
              return conditions;
            }
            return [];
          },
        );
      const result = await request(app)
        .get('/roles/conditions?pluginId=scaffolder')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual([]);
    });

    it('should be returned condition decision by resourceType', async () => {
      conditionalStorage.filterConditions = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _pluginId: string,
            resourceType: string,
          ) => {
            if (resourceType === 'catalog-entity') {
              return conditions;
            }
            return [];
          },
        );
      const result = await request(app)
        .get('/roles/conditions?resourceType=catalog-entity')
        .send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions);
    });
  });

  describe('DELETE /roles/conditions/:id', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).delete('/roles/conditions/1').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityDeletePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should delete condition decision by id', async () => {
      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toEqual(204);
      expect(mockIdentityClient.getIdentity).toHaveBeenCalledTimes(1);
    });

    it('should fail to delete condition decision by id', async () => {
      conditionalStorage.deleteCondition = jest.fn(() => {
        throw new Error('Failed to delete condition decision by id');
      });

      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toEqual(500);
      expect(result.body.error.message).toEqual(
        'Failed to delete condition decision by id',
      );
    });

    it('should return return 400', async () => {
      const result = await request(app)
        .delete('/roles/conditions/non-number')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        message: 'Id is not a valid number.',
        name: 'InputError',
      });
    });
  });

  describe('GET /roles/condition/:id', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).get('/roles/conditions/1').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return condition decision by id', async () => {
      conditionalStorage.getCondition = jest
        .fn()
        .mockImplementation(async (id: number) => {
          if (id === 1) {
            return conditions[0];
          }
          return undefined;
        });

      const result = await request(app).get('/roles/conditions/1').send();
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(expectedConditions[0]);
      expect(mockIdentityClient.getIdentity).toHaveBeenCalledTimes(0);
    });

    it('should return return 404', async () => {
      const result = await request(app).get('/roles/conditions/1').send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual({
        message: '',
        name: 'NotFoundError',
      });
    });

    it('should return return 400', async () => {
      const result = await request(app)
        .get('/roles/conditions/non-number')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        message: 'Id is not a valid number.',
        name: 'InputError',
      });
    });
  });

  describe('POST /roles/conditions', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).post('/roles/conditions').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityCreatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should be created condition', async () => {
      conditionalStorage.createCondition = jest.fn().mockImplementation(() => {
        return 1;
      });
      pluginPermissionMetadataCollectorMock.getMetadataByPluginId = jest
        .fn()
        .mockImplementation(() => {
          const response: MetadataResponse = {
            permissions: [
              {
                name: 'catalog.entity.read',
                attributes: {
                  action: 'read',
                },
                type: 'resource',
                resourceType: 'catalog-entity',
              },
            ],
            rules: [],
          };
          return response;
        });

      const roleCondition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: { claims: ['group:default/team-a'] },
        },
      };
      const result = await request(app)
        .post('/roles/conditions')
        .send(roleCondition);

      expect(result.statusCode).toBe(201);
      expect(validateRoleConditionMock).toHaveBeenCalledWith(roleCondition);
      expect(result.body).toEqual({ id: 1 });
      expect(mockIdentityClient.getIdentity).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /roles/conditions', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).put('/roles/conditions/1').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );

      // Assert the response status code and error message
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return return 400', async () => {
      const result = await request(app)
        .put('/roles/conditions/non-number')
        .send();
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        message: 'Id is not a valid number.',
        name: 'InputError',
      });
    });

    it('should update condition decision', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);
      const conditionDecision: RoleConditionalPolicyDecision<PermissionAction> =
        {
          id: 1,
          pluginId: 'catalog',
          roleEntityRef: 'role:default/test',
          resourceType: 'catalog-entity',
          permissionMapping: ['read'],
          result: AuthorizeResult.CONDITIONAL,
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: { claims: ['group:default/team-a'] },
          },
        };
      const result = await request(app)
        .put('/roles/conditions/1')
        .send(conditionDecision);

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityUpdatePermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(validateRoleConditionMock).toHaveBeenCalledWith(conditionDecision);

      expect(result.statusCode).toBe(200);
      expect(conditionalStorage.updateCondition).toHaveBeenCalledWith(1, {
        id: 1,
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        resourceType: 'catalog-entity',
        permissionMapping: [
          {
            action: 'read',
            name: 'catalog.entity.read',
          },
        ],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: { claims: ['group:default/team-a'] },
        },
      });
      expect(mockIdentityClient.getIdentity).toHaveBeenCalledTimes(1);
    });
  });

  describe('list plugin permissions and condition rules', () => {
    it('should return list plugins permission', async () => {
      const pluginMetadata: PluginPermissionMetaData[] = [
        {
          pluginId: 'permissions',
          policies: [
            {
              permission: 'policy-entity',
              policy: 'read',
            },
          ],
        },
      ];
      pluginPermissionMetadataCollectorMock.getPluginPolicies = jest
        .fn()
        .mockImplementation(async () => {
          return pluginMetadata;
        });
      const result = await request(app).get('/plugins/policies').send();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(pluginMetadata);
    });

    it('should return a status of Unauthorized for /plugins/policies', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/policies').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should return list plugins condition rules', async () => {
      const rules: PluginMetadataResponseSerializedRule[] = [
        {
          pluginId: 'catalog',
          rules: [
            {
              description: 'Allow entities with the specified label',
              name: 'HAS_LABEL',
              paramsSchema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                additionalProperties: false,
                properties: {
                  label: {
                    description: 'Name of the label to match on',
                    type: 'string',
                  },
                },
                required: ['label'],
                type: 'object',
              },
              resourceType: 'catalog-entity',
            },
          ],
        },
      ];
      pluginPermissionMetadataCollectorMock.getPluginConditionRules = jest
        .fn()
        .mockImplementation(async () => {
          return rules;
        });
      const result = await request(app).get('/plugins/condition-rules').send();
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual(rules);
    });

    it('should return a status of Unauthorized for /plugins/condition-rules', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/plugins/condition-rules').send();

      expect(mockedAuthorize).toHaveBeenCalledWith(
        [
          {
            permission: policyEntityReadPermission,
            resourceRef: 'policy-entity',
          },
        ],
        {
          credentials: credentials,
        },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });
  });

  describe('test rest API when permission framework disabled', () => {
    beforeAll(() => {
      config = new ConfigReader({
        backend: {
          database: {
            client: 'better-sqlite3',
            connection: ':memory:',
          },
        },
        permission: {
          enabled: false,
        },
      });
    });

    it('should not delete policy, because permission framework was disabled', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removePolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send([
          {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
        ]);

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not create policies, because permission framework was disabled', async () => {
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return policies, because permission framework was disabled', async () => {
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not update policy, because permission framework was disabled', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[2] === 'write') {
            return false;
          }
          return true;
        });
      mockEnforcer.updatePolicies = jest.fn().mockImplementation();

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
          newPolicy: [
            {
              permission: 'policy-entity',
              policy: 'read',
              effect: 'allow',
            },
          ],
        });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list all policies, because permission framework was disabled', async () => {
      mockEnforcer.getPolicy = jest.fn().mockImplementation(async () => {
        return [
          ['user:default/permission_admin', 'policy-entity', 'create', 'allow'],
          ['user:default/guest', 'policy-entity', 'read', 'allow'],
        ];
      });
      const result = await request(app).get('/policies').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list all roles, because permission framework was disabled', async () => {
      mockEnforcer.getGroupingPolicy = jest
        .fn()
        .mockImplementation(async () => {
          return [
            ['group:default/test', 'role:default/test'],
            ['group:default/team_a', 'role:default/team_a'],
          ];
        });

      const result = await request(app).get('/roles').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return role by role reference, because permission framework was disabled', async () => {
      const result = await request(app)
        .get('/roles/role/default/rbac_admin')
        .send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not create role, because permission framework was disabled', async () => {
      const result = await request(app)
        .post('/roles')
        .send({
          memberReferences: ['user:default/permission_admin'],
          name: 'role:default/rbac_admin',
        });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not update role, because permission framework was disabled', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (...param: string[]): Promise<boolean> => {
          if (param[0] === 'user:default/permission_admin') {
            return true;
          }
          return false;
        });

      const result = await request(app)
        .put('/roles/role/default/rbac_admin')
        .send({
          oldRole: {
            memberReferences: ['user:default/permission_admin'],
          },
          newRole: {
            memberReferences: ['user:default/test', 'user:default/dev'],
            name: 'role:default/rbac_admin',
            metadata: {
              source: 'rest',
              description: 'some admin role.',
            },
          },
        });

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not delete a role, because permission framework was disabled', async () => {
      mockEnforcer.hasGroupingPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removeGroupingPolicies = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete('/roles/role/default/rbac_admin')
        .send();
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list of all condition decisions, because permission framework was disabled', async () => {
      const result = await request(app).get('/roles/conditions').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not delete condition decision, because permission framework was disabled', async () => {
      const result = await request(app).delete('/roles/conditions/1').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return condition decision by id, because permission framework was disabled', async () => {
      conditionalStorage.getCondition = jest
        .fn()
        .mockImplementation(async (id: number) => {
          if (id === 1) {
            return conditions[0];
          }
          return undefined;
        });

      const result = await request(app).get('/roles/conditions/1').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not create condition, because permission framework was disabled', async () => {
      conditionalStorage.createCondition = jest.fn().mockImplementation(() => {
        return 1;
      });
      pluginPermissionMetadataCollectorMock.getMetadataByPluginId = jest
        .fn()
        .mockImplementation(() => {
          const response: MetadataResponse = {
            permissions: [
              {
                name: 'catalog.entity.read',
                attributes: {
                  action: 'read',
                },
                type: 'resource',
                resourceType: 'catalog-entity',
              },
            ],
            rules: [],
          };
          return response;
        });

      const roleCondition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: { claims: ['group:default/team-a'] },
        },
      };

      const result = await request(app)
        .post('/roles/conditions')
        .send(roleCondition);

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not update condition decision, because permission framework was disabled', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.ALLOW },
      ]);
      const conditionDecision: RoleConditionalPolicyDecision<PermissionAction> =
        {
          id: 1,
          pluginId: 'catalog',
          roleEntityRef: 'role:default/test',
          resourceType: 'catalog-entity',
          permissionMapping: ['read'],
          result: AuthorizeResult.CONDITIONAL,
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: { claims: ['group:default/team-a'] },
          },
        };

      const result = await request(app)
        .put('/roles/conditions/1')
        .send(conditionDecision);

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });

    it('should not return list plugins condition rules, because permission framework was disabled', async () => {
      const rules: PluginMetadataResponseSerializedRule[] = [
        {
          pluginId: 'catalog',
          rules: [
            {
              description: 'Allow entities with the specified label',
              name: 'HAS_LABEL',
              paramsSchema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                additionalProperties: false,
                properties: {
                  label: {
                    description: 'Name of the label to match on',
                    type: 'string',
                  },
                },
                required: ['label'],
                type: 'object',
              },
              resourceType: 'catalog-entity',
            },
          ],
        },
      ];
      pluginPermissionMetadataCollectorMock.getPluginConditionRules = jest
        .fn()
        .mockImplementation(async () => {
          return rules;
        });

      const result = await request(app).get('/plugins/condition-rules').send();

      expect(result.statusCode).toBe(404);
      expect(result.body.error).toEqual(undefined);
    });
  });
});
