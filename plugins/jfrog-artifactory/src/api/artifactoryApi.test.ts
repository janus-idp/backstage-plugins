import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import { JfrogArtifactoryApiClient } from './artifactoryApi';

describe('JfrogArtifactoryApiClient', () => {
  let discoveryApi: DiscoveryApi;
  let configApi: ConfigApi;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    discoveryApi = { getBaseUrl: jest.fn() } as unknown as DiscoveryApi;
    configApi = { getOptionalString: jest.fn() } as unknown as ConfigApi;
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('should call fetch with correct parameters and return response', async () => {
    const client = new JfrogArtifactoryApiClient({ discoveryApi, configApi });
    const response = {
      data: {
        packages: {
          edges: [
            {
              node: {
                name: 'release/something',
                description: null,
                created: '2023-04-12T10:59:22.901Z',
                versions: [
                  {
                    name: '1.2.0',
                    size: '183652466',
                    repos: {
                      name: 'somerepo/npm',
                    },
                    vulnerabilities: {
                      high: 0,
                      medium: 0,
                      low: 0,
                      info: 0,
                      unknown: 0,
                      skipped: 0,
                    },
                    stats: {
                      downloadCount: 100,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    };
    const repo = 'repo';

    (
      discoveryApi.getBaseUrl as jest.MockedFunction<DiscoveryApi['getBaseUrl']>
    ).mockResolvedValue('http://proxy');
    (
      configApi.getOptionalString as jest.MockedFunction<
        ConfigApi['getOptionalString']
      >
    ).mockReturnValue('/jfrog-artifactory/api');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(response),
    } as Response);

    const result = await client.getArtifact(repo);

    expect(result).toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://proxy/jfrog-artifactory/api/metadata/api/v1/query',
      {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          query:
            'query ($filter: PackageFilter!, $orderBy: PackageOrder) { packages (filter: $filter, orderBy: $orderBy) { edges { node { name, description, created, versions { name, size, repos { name }, package { packageType }, vulnerabilities { high, medium, low, info, unknown, skipped }, stats { downloadCount } } } } } }',
          variables: {
            filter: {
              name: `*${repo}`,
            },
            orderBy: {
              field: 'NAME',
              direction: 'DESC',
            },
          },
        }),
      },
    );
  });

  it('should throw an error if fetch fails', async () => {
    const client = new JfrogArtifactoryApiClient({ discoveryApi, configApi });
    const repo = 'repo';

    (
      discoveryApi.getBaseUrl as jest.MockedFunction<DiscoveryApi['getBaseUrl']>
    ).mockResolvedValue('http://proxy');
    (
      configApi.getOptionalString as jest.MockedFunction<
        ConfigApi['getOptionalString']
      >
    ).mockReturnValue('/jfrog-artifactory/api');
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server error',
    } as Response);

    await expect(client.getArtifact(repo)).rejects.toThrow(
      'failed to fetch data, status 500: Server error',
    );
  });
});
