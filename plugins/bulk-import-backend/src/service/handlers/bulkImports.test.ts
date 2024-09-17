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

import { getVoidLogger } from '@backstage/backend-common';
import {
  AuthService,
  BackstageCredentials,
  BackstagePrincipalTypes,
  CacheService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';

import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { GithubApiService } from '../githubApiService';
import { deleteImportByRepo, findAllImports } from './bulkImports';

const mockDiscovery = {
  getBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
  getExternalBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
};

const config = new ConfigReader({
  app: {
    baseUrl: 'https://my-backstage-app.example.com',
  },
  integrations: {
    github: [
      {
        host: 'github.com',
        apps: [
          {
            appId: 1,
            privateKey: 'privateKey',
            webhookSecret: '123',
            clientId: 'CLIENT_ID',
            clientSecret: 'CLIENT_SECRET',
          },
        ],
        token: 'hardcoded_token',
      },
    ],
  },
});

describe('bulkimports.ts tests', () => {
  let logger: Logger;
  let mockAuth: AuthService;
  let mockCatalogClient: CatalogClient;
  let mockCatalogInfoGenerator: CatalogInfoGenerator;
  let mockCache: CacheService;
  let mockGithubApiService: GithubApiService;

  beforeAll(() => {
    logger = getVoidLogger();
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
    mockCatalogClient = {
      getEntitiesByRefs: jest.fn(),
      validateEntity: jest.fn(),
      addLocation: jest.fn(),
      queryEntities: jest.fn(),
      refreshEntity: jest.fn(),
    } as unknown as CatalogClient;
    mockCatalogInfoGenerator = new CatalogInfoGenerator(
      logger,
      mockDiscovery,
      mockAuth,
      mockCatalogClient,
    );
    const mockCacheStore = new Map<string, any>();
    mockCache = {
      delete: jest
        .fn()
        .mockImplementation(async (key: string): Promise<void> => {
          mockCacheStore.delete(key);
        }),
      get: jest.fn().mockImplementation(async (key: string): Promise<any> => {
        return Promise.resolve(mockCacheStore.get(key));
      }),
      set: jest
        .fn()
        .mockImplementation(
          async (key: string, value: any, _options?: any): Promise<void> => {
            mockCacheStore.set(key, value);
          },
        ),
      withOptions: jest.fn(),
    };
    mockGithubApiService = new GithubApiService(logger, config, mockCache);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('findAllImports', () => {
    it('should return only imports from repos that are accessible from the configured GH integrations', async () => {
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([
          // from app-config
          'https://github.com/my-org-1/my-repo-11/blob/main/catalog-info.yaml',
          'https://github.com/my-org-1/my-repo-12/blob/main/some/path/to/catalog-info.yaml',
          'https://github.com/my-user/my-repo-123/blob/main/catalog-info.yaml',
          'https://github.com/some-public-org/some-public-repo/blob/main/catalog-info.yaml',

          // from some Locations
          'https://github.com/my-org-2/my-repo-21/blob/master/catalog-info.yaml',
          'https://github.com/my-org-2/my-repo-22/blob/master/catalog-info.yaml',
          'https://github.com/my-org-21/my-repo-211/blob/another-branch/catalog-info.yaml',

          // from some Location entities (simulating repos that could be auto-discovered by the discovery plugin)
          'https://github.com/my-org-3/my-repo-31/blob/main/catalog-info.yaml',
          'https://github.com/my-org-3/my-repo-32/blob/dev/catalog-info.yaml',
          'https://github.com/my-org-3/my-repo-33/blob/dev/all.yaml',
          'https://github.com/my-org-3/my-repo-34/blob/dev/path/to/catalog-info.yaml',
        ]);
      jest
        .spyOn(mockGithubApiService, 'getRepositoryFromIntegrations')
        .mockImplementation(async (repoUrl: string) => {
          let defaultBranch = 'main';
          switch (repoUrl) {
            case 'https://github.com/my-org-2/my-repo-21':
            case 'https://github.com/my-org-2/my-repo-22':
              defaultBranch = 'master';
              break;
            case 'https://github.com/my-org-3/my-repo-32':
            case 'https://github.com/my-org-3/my-repo-33':
              defaultBranch = 'dev';
              break;
            default:
              break;
          }
          const gitUrl = gitUrlParse(repoUrl);
          return {
            repository: {
              name: gitUrl.name,
              full_name: gitUrl.full_name,
              url: repoUrl,
              html_url: repoUrl,
              updated_at: null,
              default_branch: defaultBranch,
            },
          };
        });
      jest
        .spyOn(
          mockGithubApiService,
          'filterLocationsAccessibleFromIntegrations',
        )
        .mockResolvedValue([
          // only repos that are accessible from the configured GH integrations
          // are considered as valid Imports
          'https://github.com/my-org-1/my-repo-11/blob/main/catalog-info.yaml', // PR
          'https://github.com/my-user/my-repo-123/blob/main/catalog-info.yaml', // PR Error
          'https://github.com/my-org-2/my-repo-21/blob/master/catalog-info.yaml', // ADDED
          'https://github.com/my-org-2/my-repo-22/blob/master/catalog-info.yaml', // no PR => null status
          'https://github.com/my-org-3/my-repo-31/blob/main/catalog-info.yaml', // ADDED
          'https://github.com/my-org-3/my-repo-32/blob/dev/catalog-info.yaml', // PR
        ]);
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockImplementation((_logger, input) => {
          const resp: {
            prNum?: number;
            prUrl?: string;
          } = {};
          switch (input.repoUrl) {
            case 'https://github.com/my-user/my-repo-123':
              return Promise.reject(
                new Error(
                  'could not find out if there is an import PR open on this repo',
                ),
              );
            case 'https://github.com/my-org-1/my-repo-11':
              resp.prNum = 987;
              resp.prUrl = `https://github.com/my-org-1/my-repo-11/pull/${resp.prNum}`;
              break;
            case 'https://github.com/my-org-3/my-repo-32':
              resp.prNum = 100;
              resp.prUrl = `https://github.com/my-org-2/my-repo-21/pull/${resp.prNum}`;
              break;
            default:
              break;
          }
          return Promise.resolve(resp);
        });
      jest
        .spyOn(mockGithubApiService, 'doesCatalogInfoAlreadyExistInRepo')
        .mockImplementation((_logger, input) => {
          return Promise.resolve(
            [
              'https://github.com/my-org-2/my-repo-21',
              'https://github.com/my-org-3/my-repo-31',
            ].includes(input.repoUrl),
          );
        });
      jest
        .spyOn(mockCatalogInfoGenerator, 'findLocationEntitiesByTargetUrl')
        .mockResolvedValue([]);

      const resp = await findAllImports(
        logger,
        config,
        mockGithubApiService,
        mockCatalogInfoGenerator,
      );
      expect(resp.statusCode).toEqual(200);
      expect(resp.responseBody).toEqual([
        {
          id: 'https://github.com/my-org-1/my-repo-11',
          repository: {
            url: 'https://github.com/my-org-1/my-repo-11',
            name: 'my-repo-11',
            organization: 'my-org-1',
            id: 'my-org-1/my-repo-11',
            defaultBranch: 'main',
          },
          approvalTool: 'GIT',
          status: 'WAIT_PR_APPROVAL',
          github: {
            pullRequest: {
              number: 987,
              url: 'https://github.com/my-org-1/my-repo-11/pull/987',
            },
          },
        },
        {
          id: 'https://github.com/my-user/my-repo-123',
          repository: {
            url: 'https://github.com/my-user/my-repo-123',
            name: 'my-repo-123',
            organization: 'my-user',
            id: 'my-user/my-repo-123',
            defaultBranch: 'main',
          },
          approvalTool: 'GIT',
          status: 'PR_ERROR',
          errors: [
            'could not find out if there is an import PR open on this repo',
          ],
        },
        {
          id: 'https://github.com/my-org-2/my-repo-21',
          repository: {
            url: 'https://github.com/my-org-2/my-repo-21',
            name: 'my-repo-21',
            organization: 'my-org-2',
            id: 'my-org-2/my-repo-21',
            defaultBranch: 'master',
          },
          approvalTool: 'GIT',
          status: 'ADDED',
        },
        {
          id: 'https://github.com/my-org-2/my-repo-22',
          repository: {
            url: 'https://github.com/my-org-2/my-repo-22',
            name: 'my-repo-22',
            organization: 'my-org-2',
            id: 'my-org-2/my-repo-22',
            defaultBranch: 'master',
          },
          approvalTool: 'GIT',
          status: null,
        },
        {
          id: 'https://github.com/my-org-3/my-repo-31',
          repository: {
            url: 'https://github.com/my-org-3/my-repo-31',
            name: 'my-repo-31',
            organization: 'my-org-3',
            id: 'my-org-3/my-repo-31',
            defaultBranch: 'main',
          },
          approvalTool: 'GIT',
          status: 'ADDED',
        },
        {
          id: 'https://github.com/my-org-3/my-repo-32',
          repository: {
            url: 'https://github.com/my-org-3/my-repo-32',
            name: 'my-repo-32',
            organization: 'my-org-3',
            id: 'my-org-3/my-repo-32',
            defaultBranch: 'dev',
          },
          approvalTool: 'GIT',
          status: 'WAIT_PR_APPROVAL',
          github: {
            pullRequest: {
              number: 100,
              url: 'https://github.com/my-org-2/my-repo-21/pull/100',
            },
          },
        },
      ]);
    });
  });

  describe('deleteImportByRepo', () => {
    it('should not try to delete PR is there is no open import PR, but still try to delete import branch if any', async () => {
      const repoUrl = 'https://github.com/my-org-1/my-repo-11';
      const defaultBranch = 'main';
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest.spyOn(mockGithubApiService, 'closePR').mockResolvedValue();
      jest
        .spyOn(mockGithubApiService, 'deleteImportBranch')
        .mockResolvedValue();
      jest
        .spyOn(
          mockCatalogInfoGenerator,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue([
          {
            id: 'location-id-11',
            target: `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
          },
        ]);
      jest
        .spyOn(mockCatalogInfoGenerator, 'deleteCatalogLocationById')
        .mockResolvedValue();
      await deleteImportByRepo(
        logger,
        config,
        mockGithubApiService,
        mockCatalogInfoGenerator,
        repoUrl,
        defaultBranch,
      );

      expect(mockGithubApiService.closePR).not.toHaveBeenCalled();
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenNthCalledWith(
        1,
        logger,
        expect.objectContaining({
          repoUrl,
        }),
      );
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenNthCalledWith(1, 'location-id-11');
    });

    it('should try to delete both PR and branch is there is an open import PR', async () => {
      const repoUrl = 'https://github.com/my-org-1/my-repo-12';
      const defaultBranch = 'dev';
      const prNum = 123456789;
      jest.spyOn(mockGithubApiService, 'findImportOpenPr').mockResolvedValue({
        prNum,
        prUrl: `${repoUrl}/pull/${prNum}`,
      });
      jest.spyOn(mockGithubApiService, 'closePR').mockResolvedValue();
      jest
        .spyOn(mockGithubApiService, 'deleteImportBranch')
        .mockResolvedValue();
      jest
        .spyOn(
          mockCatalogInfoGenerator,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue([
          {
            id: 'location-id-12',
            target: `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
          },
        ]);
      jest
        .spyOn(mockCatalogInfoGenerator, 'deleteCatalogLocationById')
        .mockResolvedValue();
      await deleteImportByRepo(
        logger,
        config,
        mockGithubApiService,
        mockCatalogInfoGenerator,
        repoUrl,
        defaultBranch,
      );

      expect(mockGithubApiService.closePR).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.closePR).toHaveBeenCalledWith(
        logger,
        expect.objectContaining({
          repoUrl,
          comment:
            'Closing PR upon request for bulk import deletion. This request was created from [Red Hat Developer Hub](https://my-backstage-app.example.com).',
        }),
      );
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledWith(
        logger,
        expect.objectContaining({
          repoUrl,
        }),
      );
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCatalogInfoGenerator.deleteCatalogLocationById,
      ).toHaveBeenCalledWith('location-id-12');
    });
  });
});
