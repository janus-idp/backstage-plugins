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
import { CatalogClient } from '@backstage/catalog-client';
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';

import express from 'express';
import request from 'supertest';

import { CatalogInfoGenerator } from '../helpers';
import { GithubOrganizationResponse, GithubRepositoryResponse } from '../types';
import { GithubApiService } from './githubApiService';
import { createRouter } from './router';

const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
  jest.fn();
const mockedPermissionQuery: jest.MockedFunction<
  PermissionEvaluator['authorizeConditional']
> = jest.fn();

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
  authorizeConditional: mockedPermissionQuery,
};

const allowAll: PermissionEvaluator['authorize'] &
  PermissionEvaluator['authorizeConditional'] = async queries => {
  return queries.map(() => ({
    result: AuthorizeResult.ALLOW,
  }));
};

const mockAddLocation = jest.fn();
const mockValidateEntity = jest.fn();
const mockGetEntitiesByRefs = jest.fn();

const configuration = new ConfigReader({
  app: {
    baseUrl: 'https://my-backstage-app.example.com',
  },
});

describe('createRouter', () => {
  let app: express.Express;
  let mockCatalogClient: CatalogClient;

  beforeAll(async () => {
    mockCatalogClient = {
      getEntitiesByRefs: mockGetEntitiesByRefs,
      validateEntity: mockValidateEntity,
      addLocation: mockAddLocation,
      queryEntities: jest.fn,
    } as unknown as CatalogClient;
    const router = await createRouter({
      logger: getVoidLogger(),
      config: configuration,
      permissions: permissionEvaluator,
      discovery: mockDiscovery,
      catalogApi: mockCatalogClient,
      identity: mockIdentityClient,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /ping', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/ping');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /organizations', () => {
    it('returns 200 when organizations are fetched without errors', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getOrganizationsFromIntegrations')
        .mockResolvedValue({
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
          errors: [],
        });

      const response = await request(app).get('/organizations');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
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

    it('returns 200 with the errors in the body when organizations are fetched, but errors have occurred', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

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
        .spyOn(GithubApiService.prototype, 'getOrganizationsFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);

      const response = await request(app).get('/organizations');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github App with ID 2 failed spectacularly'],
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
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getOrganizationsFromIntegrations')
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
    it('returns 200 when repositories are fetched without errors', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
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
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
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
      mockedPermissionQuery.mockImplementation(allowAll);

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
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);
      jest
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
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
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
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
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/repositories');

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: ['Github App with ID 1234567890 returned an error'],
      });
    });
  });

  describe('GET /organizations/{org}/repositories', () => {
    it('returns 200 when repositories are fetched without errors', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getOrgRepositoriesFromIntegrations')
        .mockImplementation(
          async (
            orgName: string,
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
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
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
      mockedPermissionQuery.mockImplementation(allowAll);

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
        .spyOn(GithubApiService.prototype, 'getOrgRepositoriesFromIntegrations')
        .mockResolvedValue(githubApiServiceResponse);
      jest
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
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
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getOrgRepositoriesFromIntegrations')
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
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
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
    it('returns 200 with empty list when there is nothing in catalog yet and no open PR for each repo', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
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
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
        .mockResolvedValue({});
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
        .mockResolvedValue([]);

      const response = await request(app).get('/imports');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('returns 200 with appropriate import status', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);

      jest
        .spyOn(GithubApiService.prototype, 'getRepositoriesFromIntegrations')
        .mockResolvedValue({
          repositories: [
            {
              name: 'A',
              full_name: 'my-ent-org-1/A',
              url: 'https://api.github.com/repos/my-ent-org-1/A',
              html_url: 'https://github.com/my-ent-org-1/A',
              default_branch: 'dev',
            },
            {
              name: 'B',
              full_name: 'my-ent-org-1/B',
              url: 'https://api.github.com/repos/my-ent-org-1/B',
              html_url: 'https://github.com/my-ent-org-1/B',
              default_branch: 'main',
            },
            {
              name: 'A',
              full_name: 'my-ent-org-2/A',
              url: 'https://api.github.com/repos/my-ent-org-2/A',
              html_url: 'https://github.com/my-ent-org-2/A',
              default_branch: 'dev',
            },
          ],
          errors: [],
        });
      jest
        .spyOn(GithubApiService.prototype, 'findImportOpenPr')
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
            case 'https://github.com/my-ent-org-2/A':
              resp.prNum = 987;
              resp.prUrl = `https://github.com/my-ent-org-2/A/pull/${resp.prNum}`;
              break;
            default:
              break;
          }
          return Promise.resolve(resp);
        });
      jest
        .spyOn(GithubApiService.prototype, 'doesCatalogInfoAlreadyExistInRepo')
        .mockImplementation((_logger, input) => {
          return Promise.resolve(
            input.repoUrl === 'https://github.com/my-ent-org-1/A',
          );
        });
      jest
        .spyOn(CatalogInfoGenerator.prototype, 'listCatalogUrlLocations')
        .mockResolvedValue([
          'https://github.com/my-ent-org-1/A/blob/dev/catalog-info.yaml',
        ]);

      const response = await request(app).get('/imports');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          approvalTool: 'GIT',
          id: 'my-ent-org-1/A',
          repository: {
            defaultBranch: 'dev',
            errors: [],
            id: 'my-ent-org-1/A',
            name: 'A',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/A',
          },
          status: 'ADDED',
        },
        {
          approvalTool: 'GIT',
          errors: [
            'could not find out if there is an import PR open on this repo',
          ],
          id: 'my-ent-org-1/B',
          repository: {
            defaultBranch: 'main',
            errors: [],
            id: 'my-ent-org-1/B',
            name: 'B',
            organization: 'my-ent-org-1',
            url: 'https://github.com/my-ent-org-1/B',
          },
          status: 'PR_ERROR',
        },
        {
          approvalTool: 'GIT',
          id: 'my-ent-org-2/A',
          github: {
            pullRequest: {
              number: 987,
              url: 'https://github.com/my-ent-org-2/A/pull/987',
            },
          },
          repository: {
            defaultBranch: 'dev',
            errors: [],
            id: 'my-ent-org-2/A',
            name: 'A',
            organization: 'my-ent-org-2',
            url: 'https://github.com/my-ent-org-2/A',
          },
          status: 'WAIT_PR_APPROVAL',
        },
      ]);
    });
  });

  describe('POST /imports', () => {
    it('returns 400 if there is nothing in request body', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);
      const response = await request(app).post('/imports').send([]);
      expect(response.status).toEqual(400);
    });

    describe('dry run', () => {
      it('error if there are missing catalogEntityName in any of the request body items', async () => {
        mockedPermissionQuery.mockImplementation(allowAll);
        mockCatalogClient.queryEntities = jest
          .fn()
          .mockResolvedValue({ items: [] });
        const response = await request(app)
          .post('/imports')
          .query({ dryRun: true })
          .send([
            {
              repository: {
                url: 'https://github.com/my-org-ent-1/my-repo-a',
                defaultBranch: 'dev',
              },
            },
            {
              catalogEntityName: 'my-entity-b',
              repository: {
                url: 'https://github.com/my-org-ent-1/my-repo-b',
                defaultBranch: 'dev',
              },
            },
          ]);
        expect(response.status).toEqual(400);
        expect(response.body.errors as string[]).toContain(
          "ERROR: 'catalogEntityName' field must be specified in request body for https://github.com/my-org-ent-1/my-repo-a for dry-run operations",
        );
      });

      it('return dry-run results in errors array for each item in request body', async () => {
        mockedPermissionQuery.mockImplementation(allowAll);
        mockCatalogClient.queryEntities = jest
          .fn()
          .mockResolvedValueOnce({ items: [] })
          .mockResolvedValueOnce({
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
          });
        const response = await request(app)
          .post('/imports')
          .query({ dryRun: true })
          .send([
            {
              catalogEntityName: 'my-entity-a',
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
          ]);
        expect(response.status).toEqual(202);
        expect(response.body).toEqual([
          {
            errors: [],
            catalogEntityName: 'my-entity-a',
            repository: {
              url: 'https://github.com/my-org-ent-1/my-repo-a',
              name: 'my-repo-a',
              organization: 'my-org-ent-1',
            },
          },
          {
            errors: ['CONFLICT'],
            catalogEntityName: 'my-entity-b',
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-b',
              name: 'my-repo-b',
              organization: 'my-org-ent-2',
            },
          },
        ]);
      });
    });

    it('returns 202 with appropriate import statuses', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);
      mockCatalogClient.addLocation = jest
        .fn()
        .mockImplementation(
          (location: { type: string; target: string; dryRun: boolean }) => {
            let exists = false;
            switch (location.target) {
              case 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/blob/dev/catalog-info.yaml':
              case 'https://github.com/my-org-ent-2/animated-happiness/blob/main/catalog-info.yaml':
                exists = false;
                break;
              case 'https://github.com/my-org-ent-1/java-quarkus-starter/blob/main/catalog-info.yaml':
                exists = true;
                break;
              default:
                break;
            }
            return Promise.resolve({ exists: exists });
          },
        );

      jest
        .spyOn(GithubApiService.prototype, 'doesCatalogInfoAlreadyExistInRepo')
        .mockImplementation((_logger, input) => {
          return Promise.resolve(
            input.repoUrl ===
              'https://github.com/my-org-ent-1/java-quarkus-starter',
          );
        });

      jest
        .spyOn(GithubApiService.prototype, 'submitPrToRepo')
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
    });
  });
});
