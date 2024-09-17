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

import {
  getVoidLogger,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';
import {
  AuthService,
  BackstageCredentials,
  BackstagePrincipalTypes,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader, type Config } from '@backstage/config';

import fetch from 'node-fetch';

import { CatalogInfoGenerator } from './catalogInfoGenerator';

jest.mock('node-fetch');

const logger = getVoidLogger();

const mockBaseUrl = 'http://127.0.0.1:65535';
const mockExternalBaseUrl = 'https://127.0.0.127';

describe('catalogInfoGenerator', () => {
  let config: Config;
  let catalogInfoGenerator: CatalogInfoGenerator;
  let mockDiscovery: PluginEndpointDiscovery;
  let mockAuth: AuthService;
  let mockCatalogClient: CatalogClient;

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
    mockCatalogClient = {
      getEntities: jest.fn,
    } as unknown as CatalogClient;
    mockAuth = {
      isPrincipal<TType extends keyof BackstagePrincipalTypes>(
        _credentials: BackstageCredentials,
        _type: TType,
      ): _credentials is BackstageCredentials<BackstagePrincipalTypes[TType]> {
        return false;
      },
      getPluginRequestToken: () =>
        Promise.resolve({ token: 'ey123.abc.xyzzz' }),
      authenticate: jest.fn(),
      getNoneCredentials: jest.fn(),
      getOwnServiceCredentials: jest.fn().mockResolvedValue({
        principal: {
          subject: 'my-sub',
        },
      }),
      getLimitedUserToken: jest.fn(),
      listPublicServiceKeys: jest.fn(),
    };
    catalogInfoGenerator = new CatalogInfoGenerator(
      logger,
      mockDiscovery,
      mockAuth,
      mockCatalogClient,
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();

    config = new ConfigReader({
      catalog: {
        import: {
          entityFilename: 'my-catalog-info.yaml',
        },
      },
    });
  });

  it('should return a catalog url if no main branch is set', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    expect(catalogInfoGenerator.getCatalogUrl(config, repoUrl)).toBe(
      `${repoUrl}/blob/main/my-catalog-info.yaml`,
    );
  });

  it('should return appropriate catalog url for both repo and default branch', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    const defaultBranch = 'dev';
    expect(
      catalogInfoGenerator.getCatalogUrl(config, repoUrl, defaultBranch),
    ).toBe(`${repoUrl}/blob/${defaultBranch}/my-catalog-info.yaml`);
  });

  it('should return appropriate catalog url for both repo and default branch with default catalog-info YAML', () => {
    const repoUrl = 'https://ghe.example.com/my-org/my-repo';
    const defaultBranch = 'dev';
    expect(
      catalogInfoGenerator.getCatalogUrl(
        new ConfigReader({}),
        repoUrl,
        defaultBranch,
      ),
    ).toBe(`${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`);
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
