import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import mockFs from 'mock-fs';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import os from 'os';
import { Writable } from 'stream';

import { retrieveRecordsAction } from '.';
import res401 from './__fixtures__/{tableName}/401.json';
import res404 from './__fixtures__/{tableName}/404.json';
import res200 from './__fixtures__/{tableName}/GET/200.json';

const LOCAL_ADDR = 'https://dev12345.service-now.com' as const;

const SERVICENOW_CONFIG = {
  baseUrl: LOCAL_ADDR,
  username: 'admin',
  password: 'password', // NOSONAR
} as const;

const handlers = [
  rest.get(`${LOCAL_ADDR}/api/now/table/:tableName`, (req, res, ctx) => {
    const { tableName } = req.params;

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
      return res(ctx.status(404), ctx.json(res404));
    }

    return res(ctx.status(200), ctx.json(res200));
  }),
];

const server = setupServer(...handlers);

describe('retrieveRecords', () => {
  const action = retrieveRecordsAction({
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

  it('should retrieve records', async () => {
    const input = {
      tableName: 'incident',
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('result', res200?.result);
  });

  it('should throw an error if the table does not exist', async () => {
    const input = {
      tableName: 'invalid-table',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(action.handler(context)).rejects.toThrow(res404.error.message);
  });

  it('should throw an error if the user is not authenticated', async () => {
    const input = {
      tableName: 'incident',
    };

    const context = {
      ...mockContext,
      input,
    };

    await expect(
      retrieveRecordsAction({
        config: new ConfigReader({
          servicenow: { ...SERVICENOW_CONFIG, password: 'invalid-password' }, // NOSONAR
        }),
      }).handler(context),
    ).rejects.toThrow(res401.error.message);
  });
});
