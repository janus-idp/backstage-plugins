import {
  getVoidLogger,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';

import fetch from 'node-fetch';

import { CatalogInfoGenerator } from './catalogInfoGenerator';

jest.mock('node-fetch');

const logger = getVoidLogger();

const mockBaseUrl = 'http://127.0.0.1:65535';
const mockExternalBaseUrl = 'https://127.0.0.127';

describe('catalogInfoGenerator', () => {
  let catalogInfoGenerator: CatalogInfoGenerator;
  let mockDiscovery: PluginEndpointDiscovery;

  beforeAll(() => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve({}),
      }),
    );
    mockDiscovery = {
      getBaseUrl: (pluginId: string) =>
        Promise.resolve(`${mockBaseUrl}/my-${pluginId}`),
      getExternalBaseUrl: (pluginId: string) =>
        Promise.resolve(`${mockExternalBaseUrl}/my-${pluginId}`),
    };
    catalogInfoGenerator = new CatalogInfoGenerator(logger, mockDiscovery);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return a catalog url if no main branch is set', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    expect(catalogInfoGenerator.getCatalogUrl(repoUrl)).toBe(
      `${repoUrl}/blob/main/catalog-info.yaml`,
    );
  });

  it('should return appropriate catalog url for both repo and default branch', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    const defaultBranch = 'dev';
    expect(catalogInfoGenerator.getCatalogUrl(repoUrl, defaultBranch)).toBe(
      `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
    );
  });

  it('should fail to return a default catalog-info yaml string if a wrong repo URL is set', async () => {
    await expect(
      catalogInfoGenerator.generateDefaultCatalogInfoContent('xxxyyy'),
    ).rejects.toThrow('URL parsing failed');
  });

  it('should return a default catalog-info yaml string if analysis is not set', async () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    await expect(
      catalogInfoGenerator.generateDefaultCatalogInfoContent(repoUrl, false),
    ).resolves.toBe(getDefaultCatalogInfo('my-org', 'my-repo'));
  });

  it('should return a default catalog-info yaml string if analyze-location endpoint is not available', async () => {
    const repoUrl = 'https://github.com/my-org-2/my-repo-2';
    await expect(
      catalogInfoGenerator.generateDefaultCatalogInfoContent(repoUrl),
    ).resolves.toBe(getDefaultCatalogInfo('my-org-2', 'my-repo-2'));
  });

  it('should return a default catalog-info yaml string if analyze-location endpoint returns nothing', async () => {
    const repoUrl = 'https://github.com/my-org-3/my-repo-3';
    await expect(
      catalogInfoGenerator.generateDefaultCatalogInfoContent(repoUrl),
    ).resolves.toBe(getDefaultCatalogInfo('my-org-3', 'my-repo-3'));
    expect(fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/my-catalog/analyze-location`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          location: {
            type: 'github',
            target: repoUrl,
          },
        }),
      },
    );
  });

  it('should return catalog-info yaml string if analyze-location endpoint returns some data', async () => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({
        json: () =>
          Promise.resolve(
            mockAnalyzeLocationResponse('my-org-4', [
              'my-repo-comp-41',
              'my-repo-comp-42',
            ]),
          ),
      }),
    );

    const repoUrl = 'https://github.com/my-org-4/my-repo-4';
    await expect(
      catalogInfoGenerator.generateDefaultCatalogInfoContent(repoUrl),
    ).resolves.toBe(`---
${getDefaultCatalogInfoWithoutSeparators('my-org-4', 'my-repo-comp-41')}

---
${getDefaultCatalogInfoWithoutSeparators('my-org-4', 'my-repo-comp-42')}
`);
    expect(fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/my-catalog/analyze-location`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          location: {
            type: 'github',
            target: repoUrl,
          },
        }),
      },
    );
  });
});

function getDefaultCatalogInfo(org: string, name: string): string {
  return `---
${getDefaultCatalogInfoWithoutSeparators(org, name)}
---`;
}

function getDefaultCatalogInfoWithoutSeparators(
  org: string,
  name: string,
): string {
  return `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: ${name}
  annotations:
    github.com/project-slug: ${org}/${name}
spec:
  type: other
  lifecycle: unknown
  owner: ${org}`;
}

function mockAnalyzeLocationResponse(
  org: string,
  componentsToReturn: string[],
) {
  const generatedEntities: any[] = [];
  for (const comp of componentsToReturn) {
    generatedEntities.push({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: comp,
          annotations: {
            'github.com/project-slug': `${org}/${comp}`,
          },
        },
        spec: {
          type: 'other',
          lifecycle: 'unknown',
          owner: org,
        },
      },
    });
  }
  return {
    generateEntities: generatedEntities,
  };
}
