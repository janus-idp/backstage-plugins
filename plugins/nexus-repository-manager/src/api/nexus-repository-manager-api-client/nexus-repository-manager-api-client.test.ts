import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { type IdentityApi } from '@backstage/core-plugin-api';

import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { ConfigApiMock } from '../../__fixtures__/mocks';
import {
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
} from '../../annotations';
import { NexusRepositoryManagerApiClient } from './nexus-repository-manager-api-client';

const LOCAL_ADDR = 'https://localhost:7007/nexus-repository-manager';

const handlers = [
  rest.get(`${LOCAL_ADDR}/service/rest/v1/search`, (req, res, ctx) => {
    if (req.url.searchParams.has('docker.imageName')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/../../__fixtures__/service/rest/v1/search/docker/imageName/${req.url.searchParams.get(
              'docker.imageName',
            )}/index.json`,
          ),
        ),
      );
    }

    if (req.url.searchParams.has('docker.imageTag')) {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/../../__fixtures__/service/rest/v1/search/docker/imageTag/${req.url.searchParams.get(
              'docker.imageTag',
            )}/index.json`,
          ),
        ),
      );
    }

    return res(
      ctx.status(404),
      ctx.json(
        require(
          `${__dirname}/../../__fixtures__/service/rest/v1/search/404.json`,
        ),
      ),
    );
  }),

  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/../../__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/latest.json`,
          ),
        ),
      );
    },
  ),

  // Always returns manifest v2 schema 1, regardless of the accept header, to
  // simulate a server that does not support schema 2.
  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-33dfe6b`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/../../__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-33dfe6b-schema1.json`,
          ),
        ),
      );
    },
  ),

  // Conditionally returns manifest v2 schema 1/2, depending
  // on the accept header, to simulate a server that supports
  // both schemas.
  rest.get(
    `${LOCAL_ADDR}/repository/docker/v2/janus-idp/backstage-showcase/manifests/sha-de3dbf1`,
    (req, res, ctx) => {
      let fixtureName = 'sha-de3dbf1-schema1.json';
      if (
        req.headers
          .get('accept')
          ?.includes('application/vnd.docker.distribution.manifest.v2+json')
      ) {
        fixtureName = 'sha-de3dbf1-schema2.json';
      }

      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/../../__fixtures__/repository/docker/v2/janus-idp/backstage-showcase/manifests/${fixtureName}`,
          ),
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

    expect(components).toEqual(
      require('./../../__fixtures__/components/all.json'),
    );
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

      expect(components).toEqual(
        require('./../../__fixtures__/components/all.json'),
      );
    });

    it('should get manifest 2 schema 2 if available', async () => {
      // This is testing that when searching for a docker image, the
      // accept header is set to schema 2. It assumes the test server is
      // configured to return schema 2 for this image tag, conditional on that header being set.
      const { components } = await nexusApi.getComponents({
        dockerImageTag: 'sha-de3dbf1',
      });

      expect(components[0]?.rawAssets[0]?.schemaVersion).toEqual(2);
    });

    it('should return components using dockerImageTag', async () => {
      const { components } = await nexusApi.getComponents({
        dockerImageTag: 'latest',
      });

      expect(components).toEqual(
        require('./../../__fixtures__/components/latest.json'),
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
