import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { type ConfigApi, type IdentityApi } from '@backstage/core-plugin-api';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
} from '../../annotations';
import { NexusRepositoryManagerApiClient } from './NexusRepositoryManagerApiClient';

type MockArgs<T> = Partial<{
  [K in keyof T]: ReturnType<(typeof jest)['fn']>;
}>;

class ConfigApiMock implements ConfigApi {
  public subscribe;
  public has;
  public keys;
  public get;
  public getOptional;
  public getConfig;
  public getOptionalConfig;
  public getConfigArray;
  public getOptionalConfigArray;
  public getNumber;
  public getOptionalNumber;
  public getBoolean;
  public getOptionalBoolean;
  public getString;
  public getOptionalString;
  public getStringArray;
  public getOptionalStringArray;

  public constructor(args?: MockArgs<ConfigApi>) {
    this.subscribe = jest.fn();
    this.has = jest.fn();
    this.keys = jest.fn();
    this.get = jest.fn();
    this.getOptional = jest.fn();
    this.getConfig = jest.fn();
    this.getOptionalConfig = jest.fn();
    this.getConfigArray = jest.fn();
    this.getOptionalConfigArray = jest.fn();
    this.getNumber = jest.fn();
    this.getOptionalNumber = jest.fn();
    this.getBoolean = jest.fn();
    this.getOptionalBoolean = jest.fn();
    this.getString = jest.fn();
    this.getOptionalString = jest.fn();
    this.getStringArray = jest.fn();
    this.getOptionalStringArray = jest.fn();

    (
      Object.entries(args ?? {}) as [
        keyof MockArgs<ConfigApi>,
        MockArgs<ConfigApi>[keyof MockArgs<ConfigApi>],
      ][]
    ).forEach(([key, value]) => {
      if (value) {
        this[key] = value;
      }
    });
  }
}

const LOCAL_ADDR = 'https://localhost:7007/nexus-repository-manager';

const handlers = [
  rest.get(`${LOCAL_ADDR}/service/rest/v1/search`, (req, res, ctx) => {
    if (req.url.searchParams.has('docker.imageName')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/__fixtures__/service/rest/v1/search/docker/imageName/${req.url.searchParams.get(
            'docker.imageName',
          )}/index.json`),
        ),
      );
    }

    if (req.url.searchParams.has('docker.imageTag')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/__fixtures__/service/rest/v1/search/docker/imageTag/${req.url.searchParams.get(
            'docker.imageTag',
          )}/index.json`),
        ),
      );
    }

    return res(
      ctx.status(404),
      ctx.json(
        require(`${__dirname}/__fixtures__/service/rest/v1/search/404.json`),
      ),
    );
  }),

  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest.json`),
        ),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-33dfe6b`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-33dfe6b.json`),
        ),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-de3dbf1`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-de3dbf1.json`),
        ),
      );
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

describe('NexusRepositoryManagerApiClient', () => {
  let nexusApi: NexusRepositoryManagerApiClient;
  const identityApi = {
    async getCredentials() {
      return { token: 'Bearer token' };
    },
  } as IdentityApi;

  beforeEach(() => {
    nexusApi = new NexusRepositoryManagerApiClient({
      configApi: new ConfigApiMock(),
      discoveryApi: UrlPatternDiscovery.compile('https://localhost:7007'),
      identityApi: identityApi,
    });
  });

  it('should use the default proxy path', async () => {
    const { components } = await nexusApi.getComponents({
      dockerImageName: 'janus-idp/backstage-showcase',
    });

    expect(components).toEqual(require('./__fixtures__/components/all.json'));
  });

  it('should throw an error when the response is not ok', async () => {
    await expect(
      nexusApi.getComponents({
        dockerImageName: 'janus-idp/backstage-showcase1',
      }),
    ).rejects.toThrow('Failed to fetch');
  });

  describe('getComponents', () => {
    it('should return components using dockerImageName', async () => {
      const { components } = await nexusApi.getComponents({
        dockerImageName: 'janus-idp/backstage-showcase',
      });

      expect(components).toEqual(require('./__fixtures__/components/all.json'));
    });

    it('should return components using dockerImageTag', async () => {
      const { components } = await nexusApi.getComponents({
        dockerImageTag: 'latest',
      });

      expect(components).toEqual(
        require('./__fixtures__/components/latest.json'),
      );
    });
  });

  describe('getAnnotations', () => {
    it('should not include experimental annotations', () => {
      const { ANNOTATIONS } = nexusApi.getAnnotations();

      expect(ANNOTATIONS).toEqual(NEXUS_REPOSITORY_MANAGER_ANNOTATIONS);
    });

    it('should include experimental annotations', () => {
      nexusApi = new NexusRepositoryManagerApiClient({
        configApi: new ConfigApiMock({
          getOptionalBoolean: jest.fn().mockReturnValue(true),
        }),
        discoveryApi: UrlPatternDiscovery.compile('https://localhost:7007'),
        identityApi: identityApi,
      });

      const { ANNOTATIONS } = nexusApi.getAnnotations();

      expect(ANNOTATIONS).toEqual([
        ...NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
        ...NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
      ]);
    });
  });
});
