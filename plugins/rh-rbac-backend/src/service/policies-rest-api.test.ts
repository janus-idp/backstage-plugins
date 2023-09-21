import { errorHandler, getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { RouterOptions } from '@backstage/plugin-permission-backend';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Enforcer } from 'casbin';
import express from 'express';
import request from 'supertest';

import {
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
} from '@janus-idp/plugin-rh-rbac-common';

import { RBACPermissionPolicy } from './permission-policy';
import { PolicesServer } from './policies-rest-api';

jest.mock('@backstage/plugin-auth-node', () => ({
  getBearerTokenFromAuthorizationHeader: () => 'token',
}));

const mockEnforcer: Partial<Enforcer> = {
  addPolicy: jest
    .fn()
    .mockImplementation(async (..._param: string[]): Promise<boolean> => {
      return true;
    }),
  hasPolicy: jest
    .fn()
    .mockImplementation(async (..._param: string[]): Promise<boolean> => {
      return false;
    }),
  loadPolicy: jest.fn().mockImplementation(async () => {}),
  enableAutoSave: jest.fn().mockImplementation((_enable: boolean) => {}),
  getFilteredPolicy: jest
    .fn()
    .mockImplementation(
      async (_fieldIndex: number, ..._fieldValues: string[]) => {
        return [
          ['user:default/permission_admin', 'policy-entity', 'create', 'allow'],
        ];
      },
    ),
};

jest.mock('casbin', () => {
  const actualCasbin = jest.requireActual('casbin');
  return {
    ...actualCasbin,
    newEnforcer: jest.fn((): Promise<Partial<Enforcer>> => {
      return Promise.resolve(mockEnforcer);
    }),
  };
});

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

  let server: PolicesServer;

  beforeEach(async () => {
    mockEnforcer.hasPolicy = jest
      .fn()
      .mockImplementation(async (..._param: string[]): Promise<boolean> => {
        return false;
      });

    const config = new ConfigReader({
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
    });
    const logger = getVoidLogger();

    const options: RouterOptions = {
      config: config,
      logger,
      discovery: {
        getBaseUrl: jest.fn(),
        getExternalBaseUrl: jest.fn(),
      },
      identity: mockIdentityClient,
      policy: await RBACPermissionPolicy.build(
        logger,
        config,
        mockEnforcer as Enforcer,
      ),
    };
    server = new PolicesServer(
      mockIdentityClient,
      mockPermissionEvaluator,
      options,
      mockEnforcer as Enforcer,
    );
    const router = await server.serve();
    app = express().use(router);
    app.use(errorHandler());
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
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/').send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [{ permission: policyEntityReadPermission }],
        { token: 'token' },
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
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).post('/policies').send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [{ permission: policyEntityCreatePermission }],
        { token: 'token' },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should not be created permission policy - req body is an empty', async () => {
      const result = await request(app).post('/policies').send();

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'entityReference' must not be empty`,
      });
    });

    it('should not be created permission policy - entityReference is invalid', async () => {
      const result = await request(app)
        .post('/policies')
        .send({ entityReference: 'user' });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: Entity reference "user" had missing or empty kind (e.g. did not start with "component:" or similar)`,
      });
    });

    it('should not be created permission policy - permission is an empty', async () => {
      const result = await request(app).post('/policies').send({
        entityReference: 'user:default/permission_admin',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'permission' field must not be empty`,
      });
    });

    it('should not be created permission policy - policy is an empty', async () => {
      const result = await request(app).post('/policies').send({
        entityReference: 'user:default/permission_admin',
        permission: 'policy-entity',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'policy' field must not be empty`,
      });
    });

    it('should not be created permission policy - effect is an empty', async () => {
      const result = await request(app).post('/policies').send({
        entityReference: 'user:default/permission_admin',
        permission: 'policy-entity',
        policy: 'read',
      });

      expect(result.statusCode).toBe(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: 'effect' field must not be empty`,
      });
    });

    it('should be created permission policy', async () => {
      const result = await request(app).post('/policies').send({
        entityReference: 'user:default/permission_admin',
        permission: 'policy-entity',
        policy: 'delete',
        effect: 'deny',
      });

      expect(result.statusCode).toBe(201);
    });

    it('should not be created permission policy, because it is has been already present', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app).post('/policies').send({
        entityReference: 'user:default/permission_admin',
        permission: 'policy-entity',
        policy: 'delete',
        effect: 'deny',
      });

      expect(result.statusCode).toBe(409);
    });

    it('should not be created permission policy caused some unexpected error', async () => {
      mockEnforcer.addPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app).post('/policies').send({
        entityReference: 'user:default/permission_admin',
        permission: 'policy-entity',
        policy: 'delete',
        effect: 'deny',
      });

      expect(result.statusCode).toBe(500);
    });
  });

  describe('GET /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .get('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [{ permission: policyEntityReadPermission }],
        { token: 'token' },
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
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app).get('/policies').send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [{ permission: policyEntityReadPermission }],
        { token: 'token' },
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
        },
        {
          entityReference: 'user:default/guest',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
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
        },
      ]);
    });
  });

  describe('DELETE /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [{ permission: policyEntityDeletePermission }],
        { token: 'token' },
      );
      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: '',
      });
    });

    it('should fail to delete, because permission query is absent', async () => {
      const result = await request(app)
        .delete('/policies/user/default/permission_admin')
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: specify "permission" query param.`,
      });
    });

    it('should fail to delete, because policy query is absent', async () => {
      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity',
        )
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: specify "policy" query param.`,
      });
    });

    it('should fail to delete, because effect query is absent', async () => {
      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read',
        )
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid policy definition. Cause: specify "effect" query param.`,
      });
    });

    it('should fail to delete, because policy not found', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send();

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: '',
      });
    });

    it('should fail to delete, because unexpected error', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removePolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send();

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
      });
    });

    it('should delete policy', async () => {
      mockEnforcer.hasPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.removePolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .delete(
          '/policies/user/default/permission_admin?permission=policy-entity&policy=read&effect=allow',
        )
        .send();

      expect(result.statusCode).toEqual(204);
    });
  });

  describe('PUT /policies/:kind/:namespace/:name', () => {
    it('should return a status of Unauthorized', async () => {
      mockedAuthorizeConditional.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send();

      expect(mockedAuthorizeConditional).toHaveBeenCalledWith(
        [{ permission: policyEntityUpdatePermission }],
        { token: 'token' },
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
        .send();

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'oldPolicy' object must be present`,
      });
    });

    it('should fail to update policy - new policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `'newPolicy' object must be present`,
      });
    });

    it('should fail to update policy - oldPolicy permission is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: {}, newPolicy: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy object. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to update policy - oldPolicy policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({ oldPolicy: { permission: 'policy-entity' }, newPolicy: {} });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy object. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to update policy - oldPolicy effect is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: { permission: 'policy-entity', policy: 'read' },
          newPolicy: {},
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy object. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy permission is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {},
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy object. Cause: 'permission' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy policy is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: { permission: 'policy-entity' },
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy object. Cause: 'policy' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy effect is absent', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: { permission: 'policy-entity', policy: 'write' },
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid new policy object. Cause: 'effect' field must not be empty`,
      });
    });

    it('should fail to update policy - newPolicy effect has invalid value', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'unknown',
          },
          newPolicy: { permission: 'policy-entity', policy: 'write' },
        });

      expect(result.statusCode).toEqual(400);
      expect(result.body.error).toEqual({
        name: 'InputError',
        message: `Invalid old policy object. Cause: 'effect' has invalid value: 'unknown'. It should be: '${AuthorizeResult.ALLOW.toLocaleLowerCase()}' or '${AuthorizeResult.DENY.toLocaleLowerCase()}'`,
      });
    });

    it('should fail to update policy - old policy not found', async () => {
      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {
            permission: 'policy-entity',
            policy: 'write',
            effect: 'allow',
          },
        });

      expect(result.statusCode).toEqual(404);
      expect(result.body.error).toEqual({
        name: 'NotFoundError',
        message: '',
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
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {
            permission: 'policy-entity',
            policy: 'write',
            effect: 'allow',
          },
        });

      expect(result.statusCode).toEqual(409);
      expect(result.body.error).toEqual({
        name: 'ConflictError',
        message: '',
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
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
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
      mockEnforcer.removePolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {
            permission: 'policy-entity',
            policy: 'write',
            effect: 'allow',
          },
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
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
      mockEnforcer.removePolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.addPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return false;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {
            permission: 'policy-entity',
            policy: 'write',
            effect: 'allow',
          },
        });

      expect(result.statusCode).toEqual(500);
      expect(result.body.error).toEqual({
        name: 'Error',
        message: 'Unexpected error',
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
      mockEnforcer.removePolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });
      mockEnforcer.addPolicy = jest
        .fn()
        .mockImplementation(async (..._param: string[]): Promise<boolean> => {
          return true;
        });

      const result = await request(app)
        .put('/policies/user/default/permission_admin')
        .send({
          oldPolicy: {
            permission: 'policy-entity',
            policy: 'read',
            effect: 'allow',
          },
          newPolicy: {
            permission: 'policy-entity',
            policy: 'write',
            effect: 'allow',
          },
        });

      expect(result.statusCode).toEqual(200);
    });
  });

  describe('GetFirstQuery', () => {
    describe('getFirstQuery', () => {
      it('should return an empty string for undefined query value', () => {
        const result = server.getFirstQuery(undefined);
        expect(result).toBe('');
      });

      it('should return the first string value from a string array', () => {
        const queryValue = ['value1', 'value2'];
        const result = server.getFirstQuery(queryValue);
        expect(result).toBe('value1');
      });

      it('should throw an InputError for an array of ParsedQs', () => {
        const queryValue = [{ key: 'value' }, { key: 'value2' }];
        expect(() => {
          server.getFirstQuery(queryValue);
        }).toThrow(InputError);
      });

      it('should return the string value when query value is a string', () => {
        const queryValue = 'singleValue';
        const result = server.getFirstQuery(queryValue);
        expect(result).toBe('singleValue');
      });

      it('should throw an InputError for ParsedQs', () => {
        const queryValue = { key: 'value' };
        expect(() => {
          server.getFirstQuery(queryValue);
        }).toThrow(InputError);
      });
    });
  });
});
