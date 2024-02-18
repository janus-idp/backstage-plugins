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
import { ConfigReader } from '@backstage/config';
import {
  AuthorizeResult,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';

import express from 'express';
import request from 'supertest';

import { GithubRepositoryResponse } from '../types';
import { GithubApiService } from './githubApiService';
import { createRouter } from './router';

const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
  jest.fn();
const mockedPermissionQuery: jest.MockedFunction<
  PermissionEvaluator['authorizeConditional']
> = jest.fn();

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

const configuration = new ConfigReader({});
describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: configuration,
      permissions: permissionEvaluator,
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /repositories', () => {
    it('returns 400 when no owner field is provided in the body', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);
      const response = await request(app).post('/repositories').send();
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error:
          'No owner field provided. Please provide a valid github URL to the user or organization.',
      });
    });

    it('returns 400 when owner field is not a valid URL', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);
      const response = await request(app)
        .post('/repositories')
        .send({ owner: 'invalid' });
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        error:
          'Invalid owner field provided. Please provide a valid github URL to the user or organization.',
      });
    });
    it('returns 404 when owner field does not have a corresponding github integration', async () => {
      mockedPermissionQuery.mockImplementation(allowAll);
      const response = await request(app)
        .post('/repositories')
        .send({ owner: 'https://github.com/test' });
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        errors: [],
        repositories: [],
      });
    });
    it('returns 200 when repositories are fetched without errors', async () => {
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
        errors: [],
      };
      mockedPermissionQuery.mockImplementation(allowAll);
      const mockGetGithubRepositories = jest
        .fn()
        .mockReturnValue(githubApiServiceResponse);
      GithubApiService.prototype.getGithubRepositories =
        mockGetGithubRepositories;

      const response = await request(app)
        .post('/repositories')
        .send({ owner: 'https://github.com/backstage' });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(githubApiServiceResponse);
    });
    it('returns 207 when repositories are fetched, but errors also occurred', async () => {
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
      mockedPermissionQuery.mockImplementation(allowAll);
      const mockGetGithubRepositories = jest
        .fn()
        .mockReturnValue(githubApiServiceResponse);
      GithubApiService.prototype.getGithubRepositories =
        mockGetGithubRepositories;

      mockedPermissionQuery.mockImplementation(allowAll);
      const response = await request(app)
        .post('/repositories')
        .send({ owner: 'https://github.com/test' });
      expect(response.status).toEqual(207);
      expect(response.body).toEqual(githubApiServiceResponse);
    });
    it('returns 207 when one or more errors are returned with no successful repository fetches', async () => {
      const githubApiServiceResponse: GithubRepositoryResponse = {
        repositories: [],
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
      mockedPermissionQuery.mockImplementation(allowAll);
      const mockGetGithubRepositories = jest
        .fn()
        .mockReturnValue(githubApiServiceResponse);
      GithubApiService.prototype.getGithubRepositories =
        mockGetGithubRepositories;

      mockedPermissionQuery.mockImplementation(allowAll);
      const response = await request(app)
        .post('/repositories')
        .send({ owner: 'https://github.com/test' });
      expect(response.status).toEqual(207);
      expect(response.body).toEqual(githubApiServiceResponse);
    });
  });
});
