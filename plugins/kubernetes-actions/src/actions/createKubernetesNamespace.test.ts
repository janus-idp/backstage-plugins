import { getVoidLogger } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';

import { V1Namespace } from '@kubernetes/client-node';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import os from 'os';
import { PassThrough } from 'stream';

import { createKubernetesNamespaceAction } from './createKubernetesNamespace';

const LOCAL_ADDR = 'http://localhost:5000';
const FIXTURES_DIR = `${__dirname}/../../__fixtures__/cluster-entities`;

const handlers = [
  rest.post(`${LOCAL_ADDR}/api/v1/namespaces`, async (req, res, ctx) => {
    const ns = (await req.json()) as V1Namespace;
    if (ns.metadata?.name === 'error') {
      const error = {
        body: {
          kind: 'Status',
          apiVersion: 'v1',
          metadata: {},
          status: 'Failure',
          message: 'Unauthorized',
          reason: 'Unauthorized',
          code: 401,
        },
        statusCode: 401,
        message: 'Unauthorized',
      };
      return res(ctx.status(401), ctx.json(error));
    }
    return res(ctx.status(200), ctx.json({}));
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('kubernetes:create-namespace', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const catalogClientFn = jest.fn(async (entityRef: string) => {
    switch (entityRef) {
      case 'resource:foo':
        return require(`${FIXTURES_DIR}/foo`);
      case 'resource:bar':
        return require(`${FIXTURES_DIR}/bar`);
      case 'resource:qux':
        return require(`${FIXTURES_DIR}/qux`);
      default:
        return undefined;
    }
  });

  const action = createKubernetesNamespaceAction({
    getEntityByRef: catalogClientFn,
  } as unknown as CatalogClient);

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  it('should get the api url from the correct entity', async () => {
    await action.handler({
      ...mockContext,
      input: {
        namespace: 'foo',
        clusterRef: 'resource:foo',
        token: 'TOKEN',
      },
    });

    expect(catalogClientFn).toHaveBeenCalledTimes(1);
    expect(catalogClientFn).toHaveBeenCalledWith('resource:foo');
  });

  it.each([
    {
      entityName: 'foo',
      calledWith: 'resource:foo',
      warnMsg: 'Cluster reference in the wrong format, attempting to fix it',
      name: 'should warn and try to fix the entity name',
    },
    {
      entityName: 'resource:bar',
      calledWith: 'resource:bar',
      warnMsg: 'Resource is not of kubernetes-cluster type',
      name: 'should warn if the resource is not kubernetes-cluster',
    },
  ])('$name', async ({ entityName, calledWith, warnMsg }) => {
    const mockedWarn = jest.spyOn(mockContext.logger, 'warn');
    await action.handler({
      ...mockContext,
      input: {
        namespace: entityName,
        clusterRef: entityName,
        token: 'TOKEN',
      },
    });

    expect(mockedWarn).toHaveBeenCalledWith(warnMsg);
    expect(catalogClientFn).toHaveBeenCalledTimes(1);
    expect(catalogClientFn).toHaveBeenCalledWith(calledWith);
  });

  it.each([
    {
      entityName: 'resource:missing-entity',
      error: 'Resource not found',
      name: 'should throw if the entity is not found',
    },
    {
      entityName: 'resource:qux',
      error: 'Cluster resource is missing kubernetes.io/api-server annotation',
      name: 'should throw if the api url annotation is not present',
    },
  ])('$name', async ({ entityName, error }) => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: entityName,
          clusterRef: entityName,
          token: 'TOKEN',
        },
      });
    }).rejects.toThrow(error);

    expect(catalogClientFn).toHaveBeenCalledTimes(1);
    expect(catalogClientFn).toHaveBeenCalledWith(entityName);
  });

  it('should throw if neither url nor clusterRef is provided', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          token: 'TOKEN',
        },
      });
    }).rejects.toThrow('Cluster reference or url are required');
  });

  it('should throw if url and clusterRef are provided', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          url: 'http://example.com',
          clusterRef: 'foo',
          token: 'TOKEN',
        },
      });
    }).rejects.toThrow("Cluster reference and url can't be specified at the same time");
  });

  it('should correctly parse a http error', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'error',
          url: 'http://localhost:5000',
          token: 'TOKEN',
        },
      });
    }).rejects.toThrow('Failed to create kubernetes namespace, 401 -- Unauthorized');
  });

  it('should throw an error while using an invalid api url', async () => {
    await expect(async () => {
      await action.handler({
        ...mockContext,
        input: {
          namespace: 'foo',
          token: 'TOKEN',
          url: 'bar',
        },
      });
    }).rejects.toThrow('"bar" is an invalid url');
  });
});
