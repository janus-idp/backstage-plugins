import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import mockFs from 'mock-fs';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import os from 'os';
import { Writable } from 'stream';

import { deleteRecordAction } from '.';
import resSysId404 from './__fixtures__/{tableName}/{sys_id}/404.json';
import res401 from './__fixtures__/{tableName}/401.json';
import resTable404 from './__fixtures__/{tableName}/404.json';

const LOCAL_ADDR = 'https://dev12345.service-now.com' as const;

const SERVICENOW_CONFIG = {
  baseUrl: LOCAL_ADDR,
  username: 'admin',
  password: 'password', // NOSONAR
} as const;

const handlers = [
  rest.delete(
    `${LOCAL_ADDR}/api/now/table/:tableName/:sys_id`,
    (req, res, ctx) => {
      const { tableName, sys_id } = req.params;

      // Check if the Authorization header is set
      if (
        req.headers.get('Authorization') !==
        `Basic ${btoa(
          `${SERVICENOW_CONFIG.username}:${SERVICENOW_CONFIG.password}`,
        )}`
      ) {
        return res(ctx.status(401), ctx.json(res401));
      }

      // Check if the table name is valid
      if (tableName !== 'incident') {
        return res(ctx.status(404), ctx.json(resTable404));
      }

      // Check if the sys_id is valid
      if (sys_id !== 'valid-sys-id') {
        return res(ctx.status(404), ctx.json(resSysId404));
      }

      return res(ctx.status(200));
    },
  ),
];

const server = setupServer(...handlers);

describe('deleteRecord', () => {
  const action = deleteRecordAction({
    config: new ConfigReader({
      servicenow: SERVICENOW_CONFIG,
    }),
  });

  const mockTmpDir = os.tmpdir();
  const mockContext = {
    input: {},
    baseUrl: LOCAL_ADDR,
    workspacePath: mockTmpDir,
    logger: getVoidLogger(),
    logStream: {
      write: jest.fn(),
    } as unknown as jest.Mocked<Writable>,
    output: jest.fn(),
    createTemporaryDirectory: jest.fn().mockResolvedValue(mockTmpDir),
  };

  beforeAll(() => server.listen());

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    mockFs.restore();
    server.restoreHandlers();
  });

  afterAll(() => server.close());

  it('should delete a record', async () => {
    const input = {
      tableName: 'incident',
      sysId: 'valid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    expect(await action.handler(context)).toBeUndefined();
  });

  it('should throw an error if the table does not exist', async () => {
    const input = {
      tableName: 'invalid-table',
      sysId: 'valid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(action.handler(context)).rejects.toThrow(
      resTable404.error.message,
    );
  });

  it('should throw an error if the sysId does not exist', async () => {
    const input = {
      tableName: 'incident',
      sysId: 'invalid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(action.handler(context)).rejects.toThrow(
      resSysId404.error.message,
    );
  });

  it('should throw an error if the user is not authenticated', async () => {
    const input = {
      tableName: 'incident',
      valid: 'valid-sys-id',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(
      deleteRecordAction({
        config: new ConfigReader({
          servicenow: { ...SERVICENOW_CONFIG, password: 'invalid-password' }, // NOSONAR
        }),
      }).handler(context),
    ).rejects.toThrow(res401.error.message);
  });
});
