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

import type { LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import type { CatalogClient } from '@backstage/catalog-client';

import gitUrlParse from 'git-url-parse';

import { CatalogHttpClient } from '../../../catalog/catalogHttpClient';
import { Paths } from '../../../generated/openapi';
import { GithubApiService } from '../../../github';
import { deleteImportByRepo, findAllImports } from './bulkImports';

const config = mockServices.rootConfig({
  data: {
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
          token: 'hardcoded_token', // notsecret
        },
      ],
    },
  },
});

describe('bulkimports.ts unit tests', () => {
  let logger: LoggerService;
  let mockCatalogHttpClient: CatalogHttpClient;
  let mockGithubApiService: GithubApiService;

  beforeEach(() => {
    logger = mockServices.logger.mock();
    const mockAuth = mockServices.auth.mock({
      getPluginRequestToken: async () => {
        return {
          token: 'ey123.abc.xyzzz', // notsecret
        };
      },
    });
    const mockCache = mockServices.cache.mock();
    const mockDiscovery = mockServices.discovery.mock();
    // TODO(rm3l): Use 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
    //  once '@backstage/plugin-catalog-node' is upgraded
    const mockCatalogClient = {
      getEntitiesByRefs: jest.fn(),
      validateEntity: jest.fn(),
      addLocation: jest.fn(),
      queryEntities: jest.fn(),
      refreshEntity: jest.fn(),
    } as unknown as CatalogClient;
      mockCatalogHttpClient = new CatalogHttpClient({
          logger,
          config,
          discovery: mockDiscovery,
          auth: mockAuth,
          catalogApi: mockCatalogClient,
      }
    );
    mockGithubApiService = new GithubApiService(logger, config, mockCache);
    initializeGithubApiServiceMock();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function initializeGithubApiServiceMock() {
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
      .spyOn(mockGithubApiService, 'hasFileInRepo')
      .mockImplementation(async (input) => {
          if (input.fileName === 'catalog-info.yaml') {
              return [
                      'https://github.com/my-org-2/my-repo-21',
                      'https://github.com/my-org-3/my-repo-31',
                  ].includes(input.repoUrl);
          }
          throw new Error(`searching for presence of a file named ${input.fileName} has to be implemented in this test`);
      });
  }

  describe('findAllImports', () => {
    const locationUrls = [
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
    ];

    it.each([undefined, 'v1', 'v2'])(
      'should return only imports from repos that are accessible from the configured GH integrations (API Version: %s)',
      async apiVersionStr => {
        jest
          .spyOn(mockCatalogHttpClient, 'listCatalogUrlLocations')
          .mockResolvedValue({
            targetUrls: locationUrls,
            totalCount: locationUrls.length,
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
          .spyOn(mockCatalogHttpClient, 'findLocationEntitiesByTargetUrl')
          .mockResolvedValue([]);

        const apiVersion = apiVersionStr as
          | Paths.FindAllImports.Parameters.ApiVersion
          | undefined;
        let resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
        );
        expect(resp.statusCode).toEqual(200);
        const allImportsExpected = [
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
        ];
        let expectedResponse: any = allImportsExpected;
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: allImportsExpected,
            page: 1,
            size: 20,
            totalCount: 6,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        // Request different pages and sizes
        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            pageNumber: 1,
            pageSize: 4,
          },
        );
        expect(resp.statusCode).toEqual(200);
        expectedResponse = allImportsExpected.slice(0, 4);
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 1,
            size: 4,
            totalCount: 6,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            pageNumber: 2,
            pageSize: 4,
          },
        );
        expect(resp.statusCode).toEqual(200);
        expectedResponse = allImportsExpected.slice(4, 6);
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 2,
            size: 4,
            totalCount: 6,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        // No data for this page
        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            pageNumber: 3,
            pageSize: 4,
          },
        );
        expect(resp.statusCode).toEqual(200);
        expectedResponse = [];
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 3,
            size: 4,
            totalCount: 6,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);
      },
    );

    it.each([undefined, 'v1', 'v2'])(
      'should respect search and pagination when returning imports (API Version: %s)',
      async apiVersionStr => {
        jest
          .spyOn(mockCatalogHttpClient, 'listCatalogUrlLocations')
          .mockImplementation(
            async (
              search?: string | undefined,
              _pageNumber?: number | undefined,
              _pageSize?: number | undefined,
            ) => {
              const filteredLocations = search
                ? locationUrls.filter(l => l.toLowerCase().includes(search))
                : locationUrls;
              return {
                targetUrls: filteredLocations,
                totalCount: filteredLocations.length,
              };
            },
          );
        jest
          .spyOn(
            mockGithubApiService,
            'filterLocationsAccessibleFromIntegrations',
          )
          .mockImplementation(async (locs: string[]) => {
            const accessible = [
              // only repos that are accessible from the configured GH integrations
              // are considered as valid Imports
              'https://github.com/my-org-1/my-repo-11/blob/main/catalog-info.yaml', // PR
              'https://github.com/my-user/my-repo-123/blob/main/catalog-info.yaml', // PR Error
              'https://github.com/my-org-2/my-repo-21/blob/master/catalog-info.yaml', // ADDED
              'https://github.com/my-org-2/my-repo-22/blob/master/catalog-info.yaml', // no PR => null status
              'https://github.com/my-org-3/my-repo-31/blob/main/catalog-info.yaml', // ADDED
              'https://github.com/my-org-3/my-repo-32/blob/dev/catalog-info.yaml', // PR
            ];
            return locs.filter(loc => accessible.includes(loc));
          });
        jest
          .spyOn(mockCatalogHttpClient, 'findLocationEntitiesByTargetUrl')
          .mockResolvedValue([]);

        const apiVersion = apiVersionStr as
          | Paths.FindAllImports.Parameters.ApiVersion
          | undefined;
        let resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            search: 'lorem ipsum dolor sit amet should not return any data',
          },
        );
        expect(resp.statusCode).toEqual(200);
        let expectedResponse: any = [];
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 1,
            size: 20,
            totalCount: 0,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            search: 'my-repo-2',
          },
        );
        expect(resp.statusCode).toEqual(200);
        const allImportsExpected = [
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
        ];
        expectedResponse = allImportsExpected;
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 1,
            size: 20,
            totalCount: 2,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        // Request different pages and sizes
        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            search: 'my-repo-2',
            pageNumber: 1,
            pageSize: 1,
          },
        );
        expect(resp.statusCode).toEqual(200);
        expectedResponse = allImportsExpected.slice(0, 1);
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 1,
            size: 1,
            totalCount: 2,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            search: 'my-repo-2',
            pageNumber: 2,
            pageSize: 1,
          },
        );
        expect(resp.statusCode).toEqual(200);
        expectedResponse = allImportsExpected.slice(1, 2);
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 2,
            size: 1,
            totalCount: 2,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);

        // No data for this page
        resp = await findAllImports({
            logger,
            config,
            githubApiService: mockGithubApiService,
            catalogHttpClient: mockCatalogHttpClient,
        },
          {
            apiVersion,
          },
          {
            search: 'my-repo-2',
            pageNumber: 3,
            pageSize: 1,
          },
        );
        expect(resp.statusCode).toEqual(200);
        expectedResponse = [];
        if (apiVersion === 'v2') {
          expectedResponse = {
            imports: expectedResponse,
            page: 3,
            size: 1,
            totalCount: 2,
          };
        }
        expect(resp.responseBody).toEqual(expectedResponse);
      },
    );
  });

  describe('deleteImportByRepo', () => {
    it('should not try to delete PR is there is no open import PR, but still try to delete import branch if any', async () => {
      const repoUrl = 'https://github.com/my-org-1/my-repo-11';
      const defaultBranch = 'main';
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest.spyOn(mockGithubApiService, 'closeImportPR').mockResolvedValue();
      jest
        .spyOn(mockGithubApiService, 'deleteImportBranch')
        .mockResolvedValue();
      jest
        .spyOn(
            mockCatalogHttpClient,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue({
          locations: [
            {
              id: 'location-id-11',
              target: `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
            },
          ],
          totalCount: 1,
        });
      jest
        .spyOn(mockCatalogHttpClient, 'deleteCatalogLocationById')
        .mockResolvedValue();
      await deleteImportByRepo({
          logger,
          config,
          githubApiService: mockGithubApiService,
          catalogHttpClient: mockCatalogHttpClient,
      },
        repoUrl,
        defaultBranch,
      );

      expect(mockGithubApiService.closeImportPR).not.toHaveBeenCalled();
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          repoUrl,
        }),
      );
      expect(
          mockCatalogHttpClient.deleteCatalogLocationById,
      ).toHaveBeenCalledTimes(1);
      expect(
          mockCatalogHttpClient.deleteCatalogLocationById,
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
      jest.spyOn(mockGithubApiService, 'closeImportPR').mockResolvedValue();
      jest
        .spyOn(mockGithubApiService, 'deleteImportBranch')
        .mockResolvedValue();
      jest
        .spyOn(
            mockCatalogHttpClient,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue({
          locations: [
            {
              id: 'location-id-12',
              target: `${repoUrl}/blob/${defaultBranch}/catalog-info.yaml`,
            },
          ],
          totalCount: 1,
        });
      jest
        .spyOn(mockCatalogHttpClient, 'deleteCatalogLocationById')
        .mockResolvedValue();
      await deleteImportByRepo({
          logger,
          config,
          githubApiService: mockGithubApiService,
          catalogHttpClient: mockCatalogHttpClient,
      },
        repoUrl,
        defaultBranch,
      );

      expect(mockGithubApiService.closeImportPR).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.closeImportPR).toHaveBeenCalledWith(
        logger,
        expect.objectContaining({
          repoUrl,
          comment:
            'Closing PR upon request for bulk import deletion. This request was created from [Red Hat Developer Hub](https://my-backstage-app.example.com).',
        }),
      );
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledTimes(1);
      expect(mockGithubApiService.deleteImportBranch).toHaveBeenCalledWith(
        expect.objectContaining({
          repoUrl,
        }),
      );
      expect(
          mockCatalogHttpClient.deleteCatalogLocationById,
      ).toHaveBeenCalledTimes(1);
      expect(
          mockCatalogHttpClient.deleteCatalogLocationById,
      ).toHaveBeenCalledWith('location-id-12');
    });
  });
});
