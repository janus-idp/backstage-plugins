import { getVoidLogger } from '@backstage/backend-common';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';

import { Request } from 'express';
import { Request as JestRequest } from 'jest-express/lib/request';

import { DefaultAuditLogger } from './DefaultAuditLogger';

describe('DefaultAuditLogger', () => {
  const logger = getVoidLogger();
  const loggerSpy: jest.SpyInstance = jest.spyOn(logger, 'info');
  const loggerErrorSpy: jest.SpyInstance = jest.spyOn(logger, 'error');

  const auditLogger = new DefaultAuditLogger({
    logger,
    authService: mockServices.auth({
      pluginId: 'scaffolder',
      disableDefaultAuthPolicy: false,
    }),
    httpAuthService: mockServices.httpAuth({
      pluginId: 'scaffolder',
      defaultCredentials: mockCredentials.user(),
    }),
  });

  describe('getActorId', () => {
    it('Returns nothing if no request is provided', async () => {
      const actorId = await auditLogger.getActorId();
      expect(actorId).toBeUndefined();
    });
    it('Returns a user if a request is provided', async () => {
      const cred = mockCredentials.user.header('user:default/test');
      const request = new JestRequest();
      request.setHeaders('Authorization', cred);
      const actorId = await auditLogger.getActorId(
        request as unknown as Request,
      );

      expect(actorId).toEqual('user:default/test');
    });
    it('Returns nothing if request has invalid token', async () => {
      const cred = mockCredentials.user.invalidHeader();
      const request = new JestRequest();
      request.setHeaders('Authorization', cred);
      const actorId = await auditLogger.getActorId(
        request as unknown as Request,
      );

      expect(actorId).toBeUndefined();
    });
  });

  describe('createAuditLogDetails', () => {
    it('Generates an audit log meta object with a null actor if neither actor id or request is provided', async () => {
      const auditLogDetails = await auditLogger.createAuditLogDetails({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
      });
      expect(auditLogDetails).toEqual({
        actor: {
          actorId: null,
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        meta: {},
        isAuditLog: true,
      });
    });
    it('Generates an audit log meta object with a specified actor if actor id is provided', async () => {
      const auditLogDetails = await auditLogger.createAuditLogDetails({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        actorId: 'user:default/tester',
      });
      expect(auditLogDetails).toEqual({
        actor: {
          actorId: 'user:default/tester',
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        meta: {},
        isAuditLog: true,
      });
    });
    it('Utilizes the provided actor id over the generated one from request', async () => {
      const cred = mockCredentials.user.header('user:default/test');
      const request = new JestRequest('/api/endpoint', {
        headers: {
          Authorization: cred,
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });
      request.setIps('::1');
      request.setMethod('GET');
      request.setHostname('localhost');

      const auditLogDetails = await auditLogger.createAuditLogDetails({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        actorId: 'user:default/tester',
        request: request as unknown as Request,
      });
      expect(auditLogDetails).toEqual({
        actor: {
          actorId: 'user:default/tester',
          ip: '::1',
          hostname: 'localhost',
          userAgent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        meta: {},
        isAuditLog: true,
        request: {
          method: 'GET',
          body: '',
          params: {},
          query: {},
          url: '/api/endpoint',
        },
      });
    });
    it('Generates an audit log meta object with relevant audit information from a request and response', async () => {
      const cred = mockCredentials.user.header('user:default/test');

      const request = new JestRequest(
        '/api/endpoint/a-random-id?query=test&other=thing',
        {
          headers: {
            Authorization: cred,
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
        },
      );
      request.setIps('::1');
      request.setMethod('POST');
      request.setParams({ id: 'a-random-id' });
      request.setHostname('localhost');
      request.setBody({
        value: {
          greatValue: 'blueberries',
        },
      });

      const response = {
        status: 200,
        body: {
          content: 'wow',
        },
      };

      const auditLogDetails = await auditLogger.createAuditLogDetails({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        request: request as unknown as Request,
        response,
        metadata: {
          test: 'value',
          nested: {
            inner: 'field',
          },
        },
      });
      expect(auditLogDetails).toEqual({
        actor: {
          actorId: 'user:default/test',
          ip: '::1',
          hostname: 'localhost',
          userAgent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        meta: {
          test: 'value',
          nested: {
            inner: 'field',
          },
        },
        isAuditLog: true,
        request: {
          method: 'POST',
          body: {
            value: {
              greatValue: 'blueberries',
            },
          },
          params: { id: 'a-random-id' },
          query: {
            query: 'test',
            other: 'thing',
          },
          url: '/api/endpoint/a-random-id?query=test&other=thing',
        },
        response: response,
      });
    });
    it('Generates audit logs for errors', async () => {
      const customError = new Error(
        'This is a test error, so pay no attention to it',
      );
      customError.name = 'TestError';

      const auditLogDetails = await auditLogger.createAuditLogDetails({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'failed',
        actorId: 'user:default/tester',
        errors: [customError],
      });

      expect(auditLogDetails).toEqual({
        actor: {
          actorId: 'user:default/tester',
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'failed',
        errors: [
          {
            name: customError.name,
            message: customError.message,
            stack: customError.stack,
          },
        ],
        meta: {},
        isAuditLog: true,
      });
    });
  });

  describe('auditLog', () => {
    it('Outputs the audit log to the info level of the logger', async () => {
      await auditLogger.auditLog({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        actorId: 'user:default/tester',
        message: 'Audit Log Triggered',
      });
      expect(loggerSpy).toHaveBeenCalledWith('Audit Log Triggered', {
        actor: {
          actorId: 'user:default/tester',
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'succeeded',
        isAuditLog: true,
        meta: {},
      });
    });
    it('Outputs the audit error log to the error level of the logger', async () => {
      const customError = new Error(
        'This is a test error, so pay no attention to it',
      );
      customError.name = 'TestError';
      await auditLogger.auditLog({
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'failed',
        level: 'error',
        actorId: 'user:default/tester',
        errors: [customError],
        message: 'Audit Log Triggered',
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith('Audit Log Triggered', {
        actor: {
          actorId: 'user:default/tester',
        },
        eventName: 'TestAuditLog',
        stage: 'completion',
        status: 'failed',
        isAuditLog: true,
        meta: {},
        errors: [
          {
            name: customError.name,
            message: customError.message,
            stack: customError.stack,
          },
        ],
      });
    });
  });
});
