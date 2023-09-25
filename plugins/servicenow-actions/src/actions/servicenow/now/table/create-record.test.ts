import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import mockFs from 'mock-fs';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import os from 'os';
import { Writable } from 'stream';

import data from '../../../../__fixtures__/now/table/incident/POST/55c5be349769b9108686b680f053af63.json';
import { createRecordAction } from './create-record';

const LOCAL_ADDR = 'https://dev12345.service-now.com';

const handlers = [
  rest.post(`${LOCAL_ADDR}/api/now/table/incident`, (_, res, ctx) => {
    return res(ctx.status(201), ctx.json(data));
  }),
];

const server = setupServer(...handlers);

describe('createRecord', () => {
  const action = createRecordAction({
    config: new ConfigReader({
      servicenow: {
        baseUrl: LOCAL_ADDR,
        username: 'admin',
        password: 'password',
      },
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
    } as jest.Mocked<Partial<Writable>> as jest.Mocked<Writable>,
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

  it('should create a record', async () => {
    const input = {
      tableName: 'incident',
    };

    const context = {
      ...mockContext,
      input,
    };

    await action.handler(context);

    expect(context.output).toHaveBeenLastCalledWith('result', data.result);
  });
});
