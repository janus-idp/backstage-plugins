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
import {
  CatalogClient,
  CatalogRequestOptions,
  QueryEntitiesRequest,
  QueryEntitiesResponse,
} from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';

import express from 'express';
import request from 'supertest';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../helpers';
import {
  GithubOrganization,
  GithubOrganizationResponse,
  GithubRepository,
  GithubRepositoryResponse,
} from '../types';
import { GithubApiService } from './githubApiService';
import { DefaultPageNumber, DefaultPageSize } from './handlers/handlers';
import { createRouter } from './router';

const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
  jest.fn();

const mockUser = {
  type: 'User',
  userEntityRef: 'user:default/guest',
  ownershipEntityRefs: ['guest'],
};
const mockIdentityClient = {
  getIdentity: jest.fn().mockImplementation(async () => ({
    identity: mockUser,
  })),
};
const mockDiscovery = {
  getBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
  getExternalBaseUrl: jest.fn().mockResolvedValue('https://api.example.com'),
};

const permissionEvaluator: PermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: jest.fn(),
};

const allowAll: PermissionEvaluator['authorize'] = async queries => {
  return queries.map(() => ({
    result: AuthorizeResult.ALLOW,
  }));
};

const denyAll: PermissionEvaluator['authorize'] = async queries => {
  return queries.map(() => ({
    result: AuthorizeResult.DENY,
  }));
};

const mockAddLocation = jest.fn();
const mockValidateEntity = jest.fn();
const mockGetEntitiesByRefs = jest.fn();

const mockCache: CacheService = {
  delete: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  withOptions: jest.fn(),
};

const configuration = new ConfigReader({
  app: {
    baseUrl: 'https://my-backstage-app.example.com',
  },
  catalog: {
    locations: [
      {
        type: 'url',
        // import status should be ADDED because it contains a catalog-info.yaml in its default branch
        target:
          'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/blob/main/catalog-info.yaml',
      },
      {
        type: 'url',
        // same repo but with path not to the root of the repo => will be ignored
        target:
          'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/blob/main/path/to/some/other/component/catalog-info.yaml',
      },
      {
        type: 'url',
        // import status should be WAIT_PR_APPROVAL because it does not contain a catalog-info.yaml in its default branch but has an import PR open
        target:
          'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/blob/main/catalog-info.yaml',
      },
      {
        type: 'url',
        // import status should be null because it does not contain a catalog-info.yaml in its default branch and has no an import PR open
        target:
          'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr/blob/main/catalog-info.yaml',
      },
      {
        type: 'url',
        // Location not considered as Import job
        target:
          'https://github.com/my-org-3/another-repo/blob/main/some/path/to/my-component.yaml',
      },
    ],
  },
});

function filterOrganizations(
  organizations: GithubOrganization[],
  search?: string,
) {
  return search
    ? organizations.filter(org => org.name.toLowerCase().includes(search))
    : organizations;
}

describe('createRouter', () => {
  let app: express.Express;
  let mockAuth: AuthService;
  let mockCatalogClient: CatalogClient;
  let mockCatalogInfoGenerator: CatalogInfoGenerator;
  let mockGithubApiService: GithubApiService;

  beforeAll(async () => {
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
      getEntitiesByRefs: mockGetEntitiesByRefs,
      validateEntity: mockValidateEntity,
      addLocation: mockAddLocation,
      getEntities: jest.fn(),
      queryEntities: jest.fn(),
      refreshEntity: jest.fn(),
    } as unknown as CatalogClient;
    const voidLogger = getVoidLogger();
    mockCatalogInfoGenerator = new CatalogInfoGenerator(
      voidLogger,
      mockDiscovery,
      mockAuth,
      mockCatalogClient,
    );
    mockGithubApiService = new GithubApiService(
      voidLogger,
      configuration,
      mockCache,
    );
    const router = await createRouter({
      logger: voidLogger,
      config: configuration,
      permissions: permissionEvaluator,
      cache: mockCache,
      discovery: mockDiscovery,
      catalogApi: mockCatalogClient,
      identity: mockIdentityClient,
      catalogInfoHelper: mockCatalogInfoGenerator,
      githubApi: mockGithubApiService,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('GET /ping', () => {
    it('returns ok when unauthenticated', async () => {
      const response = await request(app).get('/ping');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('returns ok even when denied by permission framework', async () => {
      mockedAuthorize.mockImplementation(denyAll);
      const response = await request(app).get('/ping');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /organizations', () => {
    it('returns 403 when denied by permission framework', async () => {
      mockedAuthorize.mockImplementation(denyAll);
      const response = await request(app).get('/organizations');
      expect(response.status).toEqual(403);
    });

    it('returns 200 when organizations are fetched without errors', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getOrganizationsFromIntegrations')
        .mockResolvedValue({
          organizations: [
            {
              id: 166016847,
              name: 'my-org-ent-1',
              url: 'https://api.github.com/users/my-org-ent-1',
              description: 'an awesome org',
              public_repos: 10,
              total_private_repos: 25,
            },
            {
              id: 266016847,
              name: 'my-org-ent-2',
              url: 'https://api.github.com/users/my-org-ent-2',
              total_private_repos: 1234,
            },
            {
              id: 987654321,
              name: 'my-org-ent-3-undefined-repo-count',
              url: 'https://api.github.com/users/my-org-ent-3-undefined-repo-count',
            },
            {
              id: 123,
              name: 'my-org-ent-4-only-internal-repos',
              url: 'https://api.github.com/users/my-org-ent-4-only-internal-repos',
              owned_private_repos: 7,
            },
          ],
          errors: [],
        });

      const response = await request(app).get('/organizations');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        pagePerIntegration: DefaultPageNumber,
        sizePerIntegration: DefaultPageSize,
        organizations: [
          {
            id: '166016847',
            name: 'my-org-ent-1',
            url: 'https://api.github.com/users/my-org-ent-1',
            description: 'an awesome org',
            totalRepoCount: 35,
            errors: [],
          },
          {
            id: '266016847',
            name: 'my-org-ent-2',
            url: 'https://api.github.com/users/my-org-ent-2',
            totalRepoCount: 1234,
            errors: [],
          },
          {
            id: '987654321',
            name: 'my-org-ent-3-undefined-repo-count',
            url: 'https://api.github.com/users/my-org-ent-3-undefined-repo-count',
            errors: [],
          },
          {
            id: '123',
            name: 'my-org-ent-4-only-internal-repos',
            url: 'https://api.github.com/users/my-org-ent-4-only-internal-repos',
            totalRepoCount: 7,
            errors: [],
          },
        ],
      });
    });

    it('filters out organizations when a search query parameter is provided', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      const orgs = [
        {
          id: 166016847,
          name: 'my-org-ent-1',
          url: 'https://api.github.com/users/my-org-ent-1',
          description: 'an awesome org',
          public_repos: 10,
          total_private_repos: 25,
        },
        {
          id: 266016847,
          name: 'my-org-ent-2',
          url: 'https://api.github.com/users/my-org-ent-2',
          total_private_repos: 1234,
        },
        {
          id: 987654321,
          name: 'my-org-ent-3-undefined-repo-count',
          url: 'https://api.github.com/users/my-org-ent-3-undefined-repo-count',
        },
        {
          id: 123,
          name: 'my-org-ent-4-only-internal-repos',
          url: 'https://api.github.com/users/my-org-ent-4-only-internal-repos',
          owned_private_repos: 7,
        },
      ];
      jest
        .spyOn(GithubApiService.prototype, 'getOrganizationsFromIntegrations')
        .mockImplementation(
          (
            search?: string,
            _pageNumber: number = DefaultPageNumber,
            _pageSize: number = DefaultPageSize,
          ) => {
            return Promise.resolve({
              organizations: filterOrganizations(orgs, search),
              errors: [],
            });
          },
        );

      const response = await request(app).get('/organizations?search=repo');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        pagePerIntegration: DefaultPageNumber,
        sizePerIntegration: DefaultPageSize,
        organizations: [
          {
            id: '987654321',
            name: 'my-org-ent-3-undefined-repo-count',
            url: 'https://api.github.com/users/my-org-ent-3-undefined-repo-count',
            errors: [],
          },
          {
            id: '123',
            name: 'my-org-ent-4-only-internal-repos',
            url: 'https://api.github.com/users/my-org-ent-4-only-internal-repos',
            totalRepoCount: 7,
            errors: [],
          },
        ],
      });
    });

    it('returns 200 with the errors in the body when organizations are fetched, but errors have occurred', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      const githubApiServiceResponse: GithubOrganizationResponse = {
        organizations: [
          {
            id: 166016847,
            name: 'my-org-ent-1',
            url: 'https://api.github.com/users/my-org-ent-1',
            description: 'an awesome org',
          },
          {
            id: 266016847,
            name: 'my-org-ent-2',
            url: 'https://api.github.com/users/my-org-ent-2',
          },
        ],
        errors: [
          {
            error: {
              name: 'customError',
              message: 'Github App with ID 2 failed spectacularly',
            },
            type: 'app',
            appId: 2,
          },
        ],
      };
      jest
        .spyOn(mockGithubApiService, 'getOrganizationsFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);

      const response = await request(app).get('/organizations');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github App with ID 2 failed spectacularly'],
        pagePerIntegration: DefaultPageNumber,
        sizePerIntegration: DefaultPageSize,
        organizations: [
          {
            id: '166016847',
            name: 'my-org-ent-1',
            url: 'https://api.github.com/users/my-org-ent-1',
            description: 'an awesome org',
            errors: [],
          },
          {
            id: '266016847',
            name: 'my-org-ent-2',
            url: 'https://api.github.com/users/my-org-ent-2',
            errors: [],
          },
        ],
      });
    });

    it('returns 500 when one or more errors are returned with no successful organization fetched', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getOrganizationsFromIntegrations')
        .mockResolvedValue({
          organizations: [],
          errors: [
            {
              error: {
                name: 'some error',
                message: 'Github App with ID 1234567890 returned an error',
              },
              type: 'app',
              appId: 2,
            },
          ],
        });

      const response = await request(app).get('/organizations');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: ['Github App with ID 1234567890 returned an error'],
      });
    });
  });

  describe('GET /repositories', () => {
    it('returns 403 when denied by permission framework', async () => {
      mockedAuthorize.mockImplementation(denyAll);
      const response = await request(app).get('/repositories');
      expect(response.status).toEqual(403);
    });

    it('returns 200 when repositories are fetched without errors', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [
            {
              name: 'A',
              full_name: 'my-ent-org-1/A',
              url: 'https://api.github.com/repos/my-ent-org-1/A',
              html_url: 'https://github.com/my-ent-org-1/A',
              default_branch: 'master',
            },
            {
              name: 'B',
              full_name: 'my-ent-org-1/B',
              url: 'https://api.github.com/repos/my-ent-org-1/B',
              html_url: 'https://github.com/my-ent-org-1/B',
              default_branch: 'main',
            },
          ],
          errors: [],
        });
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            id: 'my-ent-org-1/A',
            name: 'A',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/A',
            errors: [],
            defaultBranch: 'master',
          },
          {
            id: 'my-ent-org-1/B',
            name: 'B',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/B',
            errors: [],
            defaultBranch: 'main',
          },
        ],
      });
    });

    it('returns 200 with the errors in the body when repositories are fetched, but errors have occurred', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      const githubApiServiceResponse: GithubRepositoryResponse = {
        repositories: [
          {
            name: 'A',
            full_name: 'backstage/A',
            url: 'https://api.github.com/repos/backstage/A',
            html_url: 'https://github.com/backstage/A',
            default_branch: 'master',
          },
          {
            name: 'B',
            full_name: 'backstage/B',
            url: 'https://api.github.com/repos/backstage/B',
            html_url: 'https://github.com/backstage/B',
            default_branch: 'main',
          },
        ],
        errors: [
          {
            error: {
              name: 'customError',
              message: 'Github App with ID 2 failed spectacularly',
            },
            type: 'app',
            appId: 2,
          },
        ],
      };
      jest
        .spyOn(mockGithubApiService, 'getRepositoriesFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github App with ID 2 failed spectacularly'],
        repositories: [
          {
            defaultBranch: 'master',
            errors: [],
            id: 'backstage/A',
            name: 'A',
            organization: 'backstage',
            url: 'https://github.com/backstage/A',
          },
          {
            defaultBranch: 'main',
            errors: [],
            id: 'backstage/B',
            name: 'B',
            organization: 'backstage',
            url: 'https://github.com/backstage/B',
          },
        ],
      });
    });

    it('returns 500 when one or more errors are returned with no successful repository fetches', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [],
          errors: [
            {
              error: {
                name: 'some error',
                message: 'Github App with ID 1234567890 returned an error',
              },
              type: 'app',
              appId: 2,
            },
          ],
        });
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: ['Github App with ID 1234567890 returned an error'],
      });
    });
  });

  describe('GET /organizations/{org}/repositories', () => {
    it('returns 403 when denied by permission framework', async () => {
      mockedAuthorize.mockImplementation(denyAll);
      const response = await request(app).get(
        '/organizations/my-ent-org-1/repositories',
      );
      expect(response.status).toEqual(403);
    });

    it('returns 200 when repositories are fetched without errors', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getOrgRepositoriesFromIntegrations')
        .mockImplementation(
          async (
            orgName: string,
            _search?: string,
            _pageNumber?: number,
            _pageSize?: number,
          ): Promise<GithubRepositoryResponse> => {
            switch (orgName) {
              case 'my-ent-org-1':
                return {
                  repositories: [
                    {
                      name: 'A',
                      full_name: 'my-ent-org-1/A',
                      url: 'https://api.github.com/repos/my-ent-org-1/A',
                      html_url: 'https://github.com/my-ent-org-1/A',
                      default_branch: 'master',
                    },
                    {
                      name: 'B',
                      full_name: 'my-ent-org-1/B',
                      url: 'https://api.github.com/repos/my-ent-org-1/B',
                      html_url: 'https://github.com/my-ent-org-1/B',
                      default_branch: 'main',
                    },
                  ],
                  errors: [],
                };
              case 'my-ent-org-2':
                return {
                  repositories: [
                    {
                      name: 'AA',
                      full_name: 'my-ent-org-2/AA',
                      url: 'https://api.github.com/repos/my-ent-org-2/AA',
                      html_url: 'https://github.com/my-ent-org-2/AA',
                      default_branch: 'master',
                    },
                    {
                      name: 'BB',
                      full_name: 'my-ent-org-2/BB',
                      url: 'https://api.github.com/repos/my-ent-org-2/BB',
                      html_url: 'https://github.com/my-ent-org-2/BB',
                      default_branch: 'main',
                    },
                  ],
                  errors: [],
                };
              default:
                return {
                  repositories: [],
                  errors: [],
                };
            }
          },
        );
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      let response = await request(app).get(
        '/organizations/my-ent-org-1/repositories',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            id: 'my-ent-org-1/A',
            name: 'A',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/A',
            errors: [],
            defaultBranch: 'master',
          },
          {
            id: 'my-ent-org-1/B',
            name: 'B',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/B',
            errors: [],
            defaultBranch: 'main',
          },
        ],
      });

      response = await request(app).get(
        '/organizations/my-ent-org-2/repositories',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            defaultBranch: 'master',
            errors: [],
            id: 'my-ent-org-2/AA',
            name: 'AA',
            organization: 'my-ent-org-2',
            url: 'https://github.com/my-ent-org-2/AA',
          },
          {
            defaultBranch: 'main',
            errors: [],
            id: 'my-ent-org-2/BB',
            name: 'BB',
            organization: 'my-ent-org-2',
            url: 'https://github.com/my-ent-org-2/BB',
          },
        ],
      });

      response = await request(app).get(
        '/organizations/my-ent-org--no-repos/repositories',
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [],
      });
    });

    it('returns 200 with the errors in the body when repositories are fetched, but errors have occurred', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      const githubApiServiceResponse: GithubRepositoryResponse = {
        repositories: [
          {
            name: 'A',
            full_name: 'backstage/A',
            url: 'https://api.github.com/repos/backstage/A',
            html_url: 'https://github.com/backstage/A',
            default_branch: 'master',
          },
          {
            name: 'B',
            full_name: 'backstage/B',
            url: 'https://api.github.com/repos/backstage/B',
            html_url: 'https://github.com/backstage/B',
            default_branch: 'main',
          },
        ],
        errors: [
          {
            error: {
              name: 'customError',
              message: 'Github App with ID 2 failed spectacularly',
            },
            type: 'app',
            appId: 2,
          },
        ],
      };
      jest
        .spyOn(mockGithubApiService, 'getOrgRepositoriesFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get(
        '/organizations/some-org/repositories',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github App with ID 2 failed spectacularly'],
        repositories: [
          {
            defaultBranch: 'master',
            errors: [],
            id: 'backstage/A',
            name: 'A',
            organization: 'backstage',
            url: 'https://github.com/backstage/A',
          },
          {
            defaultBranch: 'main',
            errors: [],
            id: 'backstage/B',
            name: 'B',
            organization: 'backstage',
            url: 'https://github.com/backstage/B',
          },
        ],
      });
    });

    it('returns 500 when one or more errors are returned with no successful repository fetched', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getOrgRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [],
          errors: [
            {
              error: {
                name: 'some error',
                message: 'Github App with ID 1234567890 returned an error',
              },
              type: 'app',
              appId: 2,
            },
          ],
        });
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get(
        '/organizations/some-org/repositories',
      );

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: ['Github App with ID 1234567890 returned an error'],
      });
    });
  });

  describe('GET /imports', () => {
    it('returns 403 when denied by permission framework', async () => {
      mockedAuthorize.mockImplementation(denyAll);
      const response = await request(app).get('/imports');
      expect(response.status).toEqual(403);
    });

    it('returns 200 with empty list when there is nothing in catalog yet and no open PR for each repo', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      jest
        .spyOn(mockGithubApiService, 'getRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [
            {
              name: 'A',
              full_name: 'my-ent-org-1/A',
              url: 'https://api.github.com/repos/my-ent-org-1/A',
              html_url: 'https://github.com/my-ent-org-1/A',
              default_branch: 'master',
            },
            {
              name: 'B',
              full_name: 'my-ent-org-1/B',
              url: 'https://api.github.com/repos/my-ent-org-1/B',
              html_url: 'https://github.com/my-ent-org-1/B',
              default_branch: 'main',
            },
          ],
          errors: [],
        });
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(mockCatalogInfoGenerator, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/imports');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('returns 200 with appropriate import status (with data coming from the repos and data coming from the app-config files)', async () => {
      mockedAuthorize.mockImplementation(allowAll);

      // fromLocationsEndpoint simulates a response from the 'GET /locations' endpoint,
      // returning Locations coming from Bulk Import or 'Register existing component'
      const fromLocationsEndpoint = [
        {
          id: '1',
          target:
            'https://github.com/my-ent-org-1/A1/blob/dev/catalog-info.yaml',
        },
        {
          id: '2',
          target:
            'https://github.com/my-ent-org-1/B/blob/main/catalog-info.yaml',
        },
        {
          id: '3',
          target:
            'https://github.com/my-ent-org-2/A2/blob/master/catalog-info.yaml',
        },
        // purposely duplicated
        {
          id: '4',
          target:
            'https://github.com/my-ent-org-2/A2/blob/master/catalog-info.yaml',
        },
        // should be ignored because the default branch is 'master'
        {
          id: '5',
          target:
            'https://github.com/my-ent-org-2/A2/blob/feature/myAwesomeFeat/catalog-info.yaml',
        },
        // some unconventional default branch name: blob/some/path/to/default/branch
        {
          id: '6',
          target:
            'https://github.com/my-ent-org-3/C/blob/blob/some/path/to/default/branch/catalog-info.yaml',
        },
        // should be ignored because we expect the catalog-info.yaml to be at the root of the default branch
        {
          id: '7',
          target:
            'https://github.com/my-org/my-repo/blob/main/plugins/my-plugin/examples/templates/01-some-template.yaml',
        },
      ];

      jest
        .spyOn(
          mockCatalogInfoGenerator,
          'listCatalogUrlLocationsByIdFromLocationsEndpoint',
        )
        .mockResolvedValue(fromLocationsEndpoint);
      jest
        .spyOn(
          mockGithubApiService,
          'filterLocationsAccessibleFromIntegrations',
        )
        .mockImplementation((locationUrls: string[]) => {
          // filter returning the same input
          return Promise.resolve(locationUrls);
        });
      jest
        .spyOn(mockGithubApiService, 'getRepositoryFromIntegrations')
        .mockImplementation(repoUrl => {
          let defaultBranch: string | undefined;
          switch (repoUrl) {
            case 'https://github.com/my-ent-org-1/A1':
              defaultBranch = 'dev';
              break;
            case 'https://github.com/my-ent-org-1/B':
              defaultBranch = 'main';
              break;
            case 'https://github.com/my-ent-org-2/A2':
              defaultBranch = 'master';
              break;
            case 'https://github.com/my-ent-org-3/C':
              defaultBranch = 'blob/some/path/to/default/branch';
              break;
            case 'https://github.com/my-org/my-repo':
              // simulate a failure to retrieve the default branch => default value should still be 'main'
              defaultBranch = undefined;
              break;
            default:
              defaultBranch = 'main';
              break;
          }
          return Promise.resolve({
            repository: {
              default_branch: defaultBranch,
              url: repoUrl,
            } as GithubRepository,
          });
        });
      jest
        .spyOn(mockGithubApiService, 'findImportOpenPr')
        .mockImplementation((_logger, input) => {
          const resp: {
            prNum?: number;
            prUrl?: string;
          } = {};
          switch (input.repoUrl) {
            case 'https://github.com/my-ent-org-1/B':
              return Promise.reject(
                new Error(
                  'could not find out if there is an import PR open on this repo',
                ),
              );
            case 'https://github.com/my-ent-org-2/A2':
              resp.prNum = 987;
              resp.prUrl = `https://github.com/my-ent-org-2/A2/pull/${resp.prNum}`;
              break;
            case 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr':
              resp.prNum = 100;
              resp.prUrl = `https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pull/${resp.prNum}`;
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
              'https://github.com/my-ent-org-1/A1',
              'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
            ].includes(input.repoUrl),
          );
        });

      mockCatalogClient.queryEntities = jest
        .fn()
        .mockImplementation(
          async (
            _request?: QueryEntitiesRequest,
            _options?: CatalogRequestOptions,
          ): Promise<QueryEntitiesResponse> => {
            return {
              items: [
                {
                  apiVersion: 'backstage.io/v1alpha1',
                  kind: 'Location',
                  metadata: {
                    name: `generated-from-tests-${Math.floor(Math.random() * 100 + 1)}`,
                    namespace: 'default',
                  },
                },
              ],
              totalItems: 1,
              pageInfo: {},
            };
          },
        );

      const response = await request(app).get('/imports');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          approvalTool: 'GIT',
          id: 'https://github.com/my-ent-org-1/A1',
          repository: {
            name: 'A1',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/A1',
            defaultBranch: 'dev',
            id: 'my-ent-org-1/A1',
          },
          status: 'ADDED',
        },
        {
          approvalTool: 'GIT',
          id: 'https://github.com/my-ent-org-2/A2',
          github: {
            pullRequest: {
              number: 987,
              url: 'https://github.com/my-ent-org-2/A2/pull/987',
            },
          },
          repository: {
            name: 'A2',
            organization: 'my-ent-org-2',
            url: 'https://github.com/my-ent-org-2/A2',
            defaultBranch: 'master',
            id: 'my-ent-org-2/A2',
          },
          status: 'WAIT_PR_APPROVAL',
        },
        {
          approvalTool: 'GIT',
          errors: [
            'could not find out if there is an import PR open on this repo',
          ],
          id: 'https://github.com/my-ent-org-1/B',
          repository: {
            name: 'B',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/B',
            defaultBranch: 'main',
            id: 'my-ent-org-1/B',
          },
          status: 'PR_ERROR',
        },
        {
          approvalTool: 'GIT',
          id: 'https://github.com/my-ent-org-3/C',
          repository: {
            defaultBranch: 'blob/some/path/to/default/branch',
            id: 'my-ent-org-3/C',
            name: 'C',
            organization: 'my-ent-org-3',
            url: 'https://github.com/my-ent-org-3/C',
          },
          status: null,
        },
        {
          approvalTool: 'GIT',
          id: 'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
          repository: {
            defaultBranch: 'main',
            id: 'my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
            name: 'my-repo-with-existing-catalog-info-in-default-branch',
            organization: 'my-org-1',
            url: 'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
          },
          status: 'ADDED',
        },
        {
          approvalTool: 'GIT',
          github: {
            pullRequest: {
              number: 100,
              url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pull/100',
            },
          },
          id: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
          repository: {
            defaultBranch: 'main',
            id: 'my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
            name: 'my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
            organization: 'my-org-1',
            url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
          },
          status: 'WAIT_PR_APPROVAL',
        },
        {
          approvalTool: 'GIT',
          id: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr',
          repository: {
            defaultBranch: 'main',
            id: 'my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr',
            name: 'my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr',
            organization: 'my-org-1',
            url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr',
          },
          status: null,
        },
      ]);
      // Location entity refresh triggered twice (on each 'ADDED' repo)
      expect(mockCatalogClient.refreshEntity).toHaveBeenCalledTimes(2);
    });
  });

  describe('POST /imports', () => {
    it('returns 403 when denied by permission framework', async () => {
      mockedAuthorize.mockImplementation(denyAll);
      const response = await request(app).post('/imports').send([]);
      expect(response.status).toEqual(403);
    });

    it('returns 400 if there is nothing in request body', async () => {
      mockedAuthorize.mockImplementation(allowAll);
      const response = await request(app).post('/imports').send([]);
      expect(response.status).toEqual(400);
    });

    it('returns 202 with appropriate import statuses', async () => {
      mockedAuthorize.mockImplementation(allowAll);
      mockCatalogClient.addLocation = jest
        .fn()
        .mockImplementation(
          (location: { type: string; target: string; dryRun: boolean }) => {
            let exists = false;
            switch (location.target) {
              case 'https://github.com/my-org-ent-1/java-quarkus-starter/blob/main/catalog-info.yaml':
                exists = true;
                break;
              case 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/blob/dev/catalog-info.yaml':
              case 'https://github.com/my-org-ent-2/animated-happiness/blob/main/catalog-info.yaml':
              default:
                break;
            }
            return Promise.resolve({ exists: exists });
          },
        );

      jest
        .spyOn(mockGithubApiService, 'doesCatalogInfoAlreadyExistInRepo')
        .mockImplementation((_logger, input) => {
          return Promise.resolve(
            input.repoUrl ===
              'https://github.com/my-org-ent-1/java-quarkus-starter',
          );
        });

      jest
        .spyOn(mockGithubApiService, 'submitPrToRepo')
        .mockImplementation((_logger, input) => {
          switch (input.repoUrl) {
            case 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation':
              return Promise.reject(
                new Error('unable to create PR due to a server error'),
              );
            case 'https://github.com/my-org-ent-2/animated-happiness':
              return Promise.resolve({
                prUrl: `${input.repoUrl}/pull/345678`,
                prNumber: 345678,
              });
            case 'https://github.com/my-org-ent-1/java-quarkus-starter':
              return Promise.resolve({
                hasChanges: false,
              });
            default:
              return Promise.reject(
                new Error(`unknown repo url: ${input.repoUrl}`),
              );
          }
        });
      mockCatalogClient.queryEntities = jest
        .fn()
        .mockImplementation(
          async (
            _request?: QueryEntitiesRequest,
            _options?: CatalogRequestOptions,
          ): Promise<QueryEntitiesResponse> => {
            return {
              items: [
                {
                  apiVersion: 'backstage.io/v1alpha1',
                  kind: 'Location',
                  metadata: {
                    name: `generated-from-tests-${Math.floor(Math.random() * 100 + 1)}`,
                    namespace: 'default',
                  },
                },
              ],
              totalItems: 1,
              pageInfo: {},
            };
          },
        );

      const response = await request(app)
        .post('/imports')
        .send([
          {
            repository: {
              url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
              defaultBranch: 'dev',
            },
          },
          {
            repository: {
              url: 'https://github.com/my-org-ent-2/animated-happiness',
              defaultBranch: 'main',
            },
            catalogInfoContent: `---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: animated-happiness
  annotations:
    github.com/project-slug: my-org-ent-2/animated-happiness
spec:
  type: other
  lifecycle: unknown
  owner: my-org-ent-2
---
`,
            github: {
              pullRequest: {
                title: 'Custom PR title: catalog-info.yaml',
              },
            },
          },
          {
            repository: {
              url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
              defaultBranch: 'main',
            },
          },
        ]);
      expect(response.status).toEqual(202);
      expect(response.body).toEqual([
        {
          errors: ['unable to create PR due to a server error'],
          repository: {
            name: 'does-not-exist-in-catalog-but-errors-with-pr-creation',
            organization: 'my-org-ent-1',
            url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
          },
          status: 'PR_ERROR',
        },
        {
          github: {
            pullRequest: {
              number: 345678,
              url: 'https://github.com/my-org-ent-2/animated-happiness/pull/345678',
            },
          },
          repository: {
            name: 'animated-happiness',
            organization: 'my-org-ent-2',
            url: 'https://github.com/my-org-ent-2/animated-happiness',
          },
          status: 'WAIT_PR_APPROVAL',
        },
        {
          repository: {
            name: 'java-quarkus-starter',
            organization: 'my-org-ent-1',
            url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
          },
          status: 'ADDED',
        },
      ]);
      // Location entity refresh triggered (on each 'ADDED' repo)
      expect(mockCatalogClient.refreshEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /imports with dryRun=true', () => {
    it('return dry-run results in errors array for each item in request body', async () => {
      mockedAuthorize.mockImplementation(allowAll);
      mockCatalogClient.queryEntities = jest.fn().mockImplementation(
        async (req: {
          filter: {
            'metadata.name': string;
          };
        }) => {
          if (req.filter['metadata.name'] === 'my-entity-b') {
            return {
              totalItems: 1,
              items: [
                {
                  apiVersion: 'backstage.io/v1alpha1',
                  kind: 'Component',
                  component: {
                    name: 'my-entity-b',
                  },
                },
              ],
            };
          }
          return { totalItems: 0, items: [] };
        },
      );

      jest
        .spyOn(mockGithubApiService, 'doesCatalogInfoAlreadyExistInRepo')
        .mockImplementation(
          async (
            _logger: Logger,
            input: {
              repoUrl: string;
            },
          ) => input.repoUrl === 'https://github.com/my-org-ent-2/my-repo-b',
        );

      jest
        .spyOn(mockGithubApiService, 'isRepoEmpty')
        .mockImplementation(
          async (input: { repoUrl: string }) =>
            input.repoUrl === 'https://github.com/my-org-ent-2/my-repo-c',
        );

      jest
        .spyOn(mockGithubApiService, 'doesCodeOwnersAlreadyExistInRepo')
        .mockImplementation(
          async (
            _logger: Logger,
            input: {
              repoUrl: string;
            },
          ) => input.repoUrl !== 'https://github.com/my-org-ent-2/my-repo-d',
        );

      const response = await request(app)
        .post('/imports')
        .query({ dryRun: true })
        .send([
          {
            // catalogEntityName not specified => catalog entity checks will be skipped
            repository: {
              url: 'https://github.com/my-org-ent-1/my-repo-a',
              defaultBranch: 'dev',
            },
          },
          {
            catalogEntityName: 'my-entity-b',
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-b',
              defaultBranch: 'main',
            },
          },
          {
            catalogEntityName: 'my-entity-c',
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-c',
              defaultBranch: 'trunk',
            },
          },
          {
            catalogEntityName: 'my-entity-d',
            codeOwnersFileAsEntityOwner: true,
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-d',
              defaultBranch: 'devBranch',
            },
          },
        ]);
      expect(response.status).toEqual(202);
      expect(response.body).toEqual([
        {
          errors: [],
          repository: {
            url: 'https://github.com/my-org-ent-1/my-repo-a',
            name: 'my-repo-a',
            organization: 'my-org-ent-1',
          },
        },
        {
          errors: [
            'CATALOG_ENTITY_CONFLICT',
            'CATALOG_INFO_FILE_EXISTS_IN_REPO',
          ],
          catalogEntityName: 'my-entity-b',
          repository: {
            url: 'https://github.com/my-org-ent-2/my-repo-b',
            name: 'my-repo-b',
            organization: 'my-org-ent-2',
          },
        },
        {
          errors: ['REPO_EMPTY'],
          catalogEntityName: 'my-entity-c',
          repository: {
            url: 'https://github.com/my-org-ent-2/my-repo-c',
            name: 'my-repo-c',
            organization: 'my-org-ent-2',
          },
        },
        {
          errors: ['CODEOWNERS_FILE_NOT_FOUND_IN_REPO'],
          catalogEntityName: 'my-entity-d',
          repository: {
            url: 'https://github.com/my-org-ent-2/my-repo-d',
            name: 'my-repo-d',
            organization: 'my-org-ent-2',
          },
        },
      ]);
    });
  });
});
