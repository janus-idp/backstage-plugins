/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { DiscoveryService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import type { CatalogClient } from '@backstage/catalog-client';

import fetch from 'node-fetch';

import { CatalogHttpClient } from './catalogHttpClient';
import { CatalogInfoGenerator } from './catalogInfoGenerator';

jest.mock('node-fetch');

const mockBaseUrl = 'http://127.0.0.1:65535';

describe('catalogInfoGenerator', () => {
  let catalogInfoGenerator: CatalogInfoGenerator;
  let mockDiscovery: DiscoveryService;

  beforeEach(() => {
    (fetch as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve({}),
      }),
    );
    mockDiscovery = mockServices.discovery.mock({
      getBaseUrl: async (pluginId: string) => {
        return `${mockBaseUrl}/my-${pluginId}`;
      },
    });
    // TODO(rm3l): Move to 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
    //  once '@backstage/plugin-catalog-node' is upgraded
    const mockCatalogClient = {
      getEntities: jest.fn(),
    } as unknown as CatalogClient;
    const mockAuth = mockServices.auth.mock({
      getPluginRequestToken: jest.fn().mockResolvedValue({
        token: 'ey123.abc.xyzzz', // notsecret
      }),
    });
    const logger = mockServices.logger.mock();
    catalogInfoGenerator = new CatalogInfoGenerator(
      logger,
      new CatalogHttpClient({
        logger,
        config: mockServices.rootConfig({ data: {} }),
        discovery: mockDiscovery,
        auth: mockAuth,
        catalogApi: mockCatalogClient,
      }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
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
    expect(mockDiscovery.getBaseUrl).toHaveBeenCalledWith('catalog');
    expect(fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/my-catalog/analyze-location`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ey123.abc.xyzzz',
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
          Authorization: 'Bearer ey123.abc.xyzzz',
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
