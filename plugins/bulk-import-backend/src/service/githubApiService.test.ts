/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getVoidLogger } from '@backstage/backend-common';
import { Config, ConfigReader } from '@backstage/config';

import gitUrlParse from 'git-url-parse';

import { CustomGithubCredentialsProvider } from '../helpers';
import { GithubApiService } from './githubApiService';

const octokit = {
  paginate: async (fn: any) => (await fn()).data,
  apps: {
    listReposAccessibleToInstallation: jest.fn(),
  },
  rest: {
    repos: {
      listForAuthenticatedUser: jest.fn(),
      listForOrg: jest.fn(),
    },
    users: {
      getByUsername: jest.fn(),
    },
  },
};

function createOctokit() {
  return octokit;
}

jest.mock('@octokit/rest', () => {
  return { Octokit: createOctokit };
});

const mockGetAllCredentials = jest.fn();
// We want to just mock the credentials provider's getAllCredentials method and nothing else
CustomGithubCredentialsProvider.prototype.getAllCredentials =
  mockGetAllCredentials;

const logger = getVoidLogger();
const errorLog = jest.spyOn(logger, 'error');

describe('GithubApiService tests', () => {
  let config: Config;
  let githubApiService: GithubApiService;

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAllCredentials.mockResolvedValue(
      Promise.resolve([
        {
          headers: { Authorization: 'Bearer hardcoded_token' },
          token: 'hardcoded_token',
          type: 'token',
        },
        {
          headers: { Authorization: 'Bearer secret_token_1' },
          token: 'secret_token_1',
          type: 'app',
          appId: 1,
        },
        {
          headers: { Authorization: 'Bearer secret_token_2' },
          token: 'secret_token_2',
          type: 'app',
          appId: 2,
        },
      ]),
    );
    config = new ConfigReader({
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
              {
                appId: 2,
                privateKey: 'privateKey2',
                webhookSecret: '456',
                clientId: 'CLIENT_ID2',
                clientSecret: 'CLIENT_SECRET2',
              },
            ],
            token: 'hardcoded_token',
          },
        ],
      },
    });
    githubApiService = new GithubApiService(logger, config);
  });

  it('returns an empty repositories and errors array if no installations were found', async () => {
    const notFoundError = new Error(
      'No app installation found for backstage in 1',
    );
    notFoundError.name = 'NotFoundError';
    const notFoundError2 = new Error(
      'No app installation found for backstage in 2',
    );
    notFoundError2.name = 'NotFoundError';
    mockGetAllCredentials.mockResolvedValue(
      Promise.resolve([
        {
          headers: { Authorization: 'Bearer hardcoded_token' },
          token: 'hardcoded_token',
          type: 'token',
        },
        {
          type: 'app',
          error: notFoundError,
          appId: 1,
        },
        {
          type: 'app',
          error: notFoundError2,
          appId: 2,
        },
      ]),
    );
    octokit.rest.users.getByUsername.mockReturnValue({
      data: {
        type: 'Organization',
      },
    });
    octokit.rest.repos.listForOrg.mockReturnValue({ data: [] });

    const parsed = gitUrlParse('https://github.com/backstage');
    const result = await githubApiService.getGithubRepositories(parsed);

    const expected_response = {
      repositories: [],
      errors: [],
    };
    expect(errorLog).not.toHaveBeenCalled();
    expect(result).toEqual(expected_response);
  });

  it('returns some repositories and an error from the access token fetch phase', async () => {
    const customError = new Error('Github App with ID 2 failed spectacularly');
    customError.name = 'customError';
    mockGetAllCredentials.mockResolvedValue(
      Promise.resolve([
        {
          headers: { Authorization: 'Bearer hardcoded_token' },
          token: 'hardcoded_token',
          type: 'token',
        },
        {
          headers: { Authorization: 'Bearer secret_token_1' },
          token: 'secret_token_1',
          type: 'app',
          appId: 1,
        },
        {
          error: customError,
          type: 'app',
          appId: 2,
        },
      ]),
    );

    octokit.rest.users.getByUsername.mockReturnValue({
      data: {
        type: 'User',
      },
    });
    octokit.rest.repos.listForAuthenticatedUser.mockReturnValue({ data: [] });
    octokit.apps.listReposAccessibleToInstallation.mockReturnValue({
      data: [
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
    });

    const parsed = gitUrlParse('https://github.com/backstage');
    const result = await githubApiService.getGithubRepositories(parsed);

    const expected_response = {
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
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog).toHaveBeenCalledWith(
      'Obtaining the Access Token Github App with appId: 2 failed with customError: Github App with ID 2 failed spectacularly',
    );
    expect(result).toEqual(expected_response);
  });

  it('returns an a list of unique repositories and no errors', async () => {
    octokit.rest.users.getByUsername.mockReturnValue({
      data: {
        type: 'Organization',
      },
    });
    octokit.rest.repos.listForOrg.mockReturnValue({ data: [] });
    octokit.apps.listReposAccessibleToInstallation
      .mockReturnValueOnce({
        data: [
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
      })
      .mockReturnValue({
        data: [
          {
            name: 'B',
            full_name: 'backstage/B',
            url: 'https://api.github.com/repos/backstage/B',
            html_url: 'https://github.com/backstage/B',
            default_branch: 'main',
          },
          {
            name: 'C',
            full_name: 'backstage/C',
            url: 'https://api.github.com/repos/backstage/C',
            html_url: 'https://github.com/backstage/C',
            default_branch: 'default',
          },
        ],
      });

    const parsed = gitUrlParse('https://github.com/backstage');
    const result = await githubApiService.getGithubRepositories(parsed);

    const expected_response = {
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
        {
          name: 'C',
          full_name: 'backstage/C',
          url: 'https://api.github.com/repos/backstage/C',
          html_url: 'https://github.com/backstage/C',
          default_branch: 'default',
        },
      ],
      errors: [],
    };
    expect(errorLog).not.toHaveBeenCalled();
    expect(result).toEqual(expected_response);
  });

  it('only returns repositories owned by the target owner when querying a user', async () => {
    octokit.rest.users.getByUsername.mockReturnValue({
      data: {
        type: 'User',
      },
    });
    octokit.rest.repos.listForAuthenticatedUser.mockReturnValue({
      data: [
        {
          name: 'A',
          full_name: 'bob/A',
          url: 'https://api.github.com/repos/bob/A',
          html_url: 'https://github.com/bob/A',
          owner: {
            login: 'bob',
          },
          default_branch: 'master',
        },
        {
          name: 'B',
          full_name: 'bob/B',
          url: 'https://api.github.com/repos/bob/B',
          html_url: 'https://github.com/bob/B',
          owner: {
            login: 'bob',
          },
          default_branch: 'main',
        },
        {
          name: 'C',
          full_name: 'backstage/C',
          url: 'https://api.github.com/repos/backstage/C',
          html_url: 'https://github.com/backstage/C',
          owner: {
            login: 'backstage',
          },
          default_branch: 'default',
        },
        {
          name: 'D',
          full_name: 'backstage/D',
          url: 'https://api.github.com/repos/backstage/D',
          html_url: 'https://github.com/backstage/D',
          owner: {
            login: 'backstage',
          },
          default_branch: 'master',
        },
      ],
    });
    octokit.apps.listReposAccessibleToInstallation.mockReturnValue({
      data: [],
    });

    const parsed = gitUrlParse('https://github.com/bob');
    const result = await githubApiService.getGithubRepositories(parsed);

    const expected_response = {
      repositories: [
        {
          name: 'A',
          full_name: 'bob/A',
          url: 'https://api.github.com/repos/bob/A',
          html_url: 'https://github.com/bob/A',
          default_branch: 'master',
        },
        {
          name: 'B',
          full_name: 'bob/B',
          url: 'https://api.github.com/repos/bob/B',
          html_url: 'https://github.com/bob/B',
          default_branch: 'main',
        },
      ],
      errors: [],
    };
    expect(errorLog).not.toHaveBeenCalled();
    expect(result).toEqual(expected_response);
  });
  it('returns list of errors if they occur during the repository fetch phase', async () => {
    octokit.rest.users.getByUsername.mockImplementationOnce(async () => {
      const githubDownError = new Error(
        "The Unicorns have taken over. We're doing our best to get them under control and get Github back up and running",
      );
      githubDownError.name = '503 Service Unavailable';
      throw githubDownError;
    });
    octokit.rest.repos.listForAuthenticatedUser.mockImplementationOnce(
      async () => {
        const customError = new Error('This is taking quite a while');
        customError.name = '504 Gateway Timeout';
        throw customError;
      },
    );
    octokit.apps.listReposAccessibleToInstallation
      .mockImplementationOnce(async () => {
        const unauthorizedError = new Error('Bad credentials');
        unauthorizedError.name = '401 Unauthorized';
        throw unauthorizedError;
      })
      .mockReturnValue({
        data: [
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
      });

    const parsed = gitUrlParse('https://github.com/bob');
    const result = await githubApiService.getGithubRepositories(parsed);

    const expected_response = {
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
            name: '503 Service Unavailable',
            message:
              "The Unicorns have taken over. We're doing our best to get them under control and get Github back up and running",
          },
          type: 'token',
        },
        {
          error: {
            name: '401 Unauthorized',
            message: 'Bad credentials',
          },
          type: 'app',
          appId: 1,
        },
      ],
    };
    expect(errorLog).toHaveBeenCalledTimes(2);
    expect(errorLog.mock.calls[0]).toEqual([
      "Fetching account with token failed with 503 Service Unavailable: The Unicorns have taken over. We're doing our best to get them under control and get Github back up and running",
    ]);
    expect(errorLog.mock.calls[1]).toEqual([
      'Fetching repositories with access token for github app 1, failed with 401 Unauthorized: Bad credentials',
    ]);
    expect(result).toEqual(expected_response);
  });
  it('returns list of repositories if we have a user token with access to an org', async () => {
    octokit.rest.users.getByUsername.mockReturnValue({
      data: {
        type: 'Organization',
      },
    });
    octokit.rest.repos.listForOrg.mockReturnValue({
      data: [
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
    });
    octokit.apps.listReposAccessibleToInstallation.mockReturnValue({
      data: [],
    });

    const parsed = gitUrlParse('https://github.com/bob');
    const result = await githubApiService.getGithubRepositories(parsed);

    const expected_response = {
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
    expect(errorLog).not.toHaveBeenCalled();
    expect(result).toEqual(expected_response);
  });
  it('throws an error if no integration matching the inputted github account is found', async () => {
    const parsed = gitUrlParse('https://github.company.com/bob');
    await expect(
      githubApiService.getGithubRepositories(parsed),
    ).rejects.toThrow(
      'There is no GitHub integration that matches https://github.company.com/bob. Please add a configuration entry for it under integrations.github.',
    );
  });
});
