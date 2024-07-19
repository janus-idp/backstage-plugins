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

import { ConfigReader } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';

import { RestEndpointMethodTypes } from '@octokit/rest';
import { DateTime } from 'luxon';

import { ExtendedGithubCredentialsProvider } from '../types';
import {
  CustomGithubCredentialsProvider,
  CustomSingleInstanceGithubCredentialsProvider,
} from './GithubAppManager';

const octokit = {
  paginate: async (fn: any) => (await fn()).data,
  apps: {
    listInstallations: jest.fn(),
    listReposAccessibleToInstallation: jest.fn(),
    createInstallationAccessToken: jest.fn(),
  },
};

function createOctokit() {
  return octokit;
}

jest.mock('@octokit/rest', () => {
  return { Octokit: createOctokit };
});

describe('CustomSingleInstanceGithubCredentialsProvider tests', () => {
  let github: ExtendedGithubCredentialsProvider;

  beforeEach(() => {
    jest.resetAllMocks();
    github = CustomSingleInstanceGithubCredentialsProvider.create({
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
    });
  });

  it('create repository specific tokens', async () => {
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'selected',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    const { token, headers, type } = await github.getCredentials({
      url: 'https://github.com/backstage/foobar',
    });
    expect(type).toEqual('app');
    expect(token).toEqual('secret_token');
    expect(headers).toEqual({ Authorization: 'Bearer secret_token' });

    // fallback to the configured token if no application is matching
    await expect(
      github.getCredentials({
        url: 'https://github.com/404/foobar',
      }),
    ).resolves.toEqual({
      headers: {
        Authorization: 'Bearer hardcoded_token',
      },
      token: 'hardcoded_token',
      type: 'token',
    });
  });

  it('creates tokens for an organization', async () => {
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'all',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    const { token, headers } = await github.getCredentials({
      url: 'https://github.com/backstage',
    });

    expect(headers).toEqual({ Authorization: 'Bearer secret_token' });
    expect(token).toEqual('secret_token');
  });

  it('creates tokens for an organization with multiple configured apps', async () => {
    const multipleGithubApps =
      CustomSingleInstanceGithubCredentialsProvider.create({
        host: 'github.com',
        apps: [
          {
            appId: 1,
            privateKey: 'privateKey',
            webhookSecret: '123',
            clientId: 'CLIENT_ID',
            clientSecret: 'CLIENT_SECRET',
            allowedInstallationOwners: ['not-allowed'],
          },
          {
            appId: 2,
            privateKey: 'privateKey_2',
            webhookSecret: '456',
            clientId: 'CLIENT_ID_2',
            clientSecret: 'CLIENT_SECRET_2',
            allowedInstallationOwners: ['allowed'],
          },
        ],
      });

    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 2,
          repository_selection: 'all',
          account: {
            login: 'allowed',
          },
        },
        {
          id: 2,
          repository_selection: 'all',
          account: {
            login: 'not-allowed',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValue({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    const { token, headers } = await multipleGithubApps.getCredentials({
      url: 'https://github.com/allowed',
    });

    expect(headers).toEqual({ Authorization: 'Bearer secret_token' });
    expect(token).toEqual('secret_token');
  });

  it('does not return a token where the organization is not in the allowedInstallationsList', async () => {
    github = CustomSingleInstanceGithubCredentialsProvider.create({
      host: 'github.com',
      apps: [
        {
          appId: 1,
          privateKey: 'privateKey',
          webhookSecret: '123',
          clientId: 'CLIENT_ID',
          clientSecret: 'CLIENT_SECRET',
          allowedInstallationOwners: ['backstage'],
        },
      ],
    });

    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'all',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    const { token, headers } = await github.getCredentials({
      url: 'https://github.com/RoadiehHQ',
    });

    expect(headers).toEqual(undefined);
    expect(token).toEqual(undefined);
  });

  it('should not fail to issue tokens for an organization when the app is installed for a single repo', async () => {
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'selected',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
        repository_selection: 'selected',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    octokit.apps.listReposAccessibleToInstallation.mockReturnValue({
      data: [{ name: 'some-repo' }],
    } as unknown as RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']);

    const { token, headers } = await github.getCredentials({
      url: 'https://github.com/backstage',
    });
    const expectedToken = 'secret_token';
    expect(headers).toEqual({ Authorization: `Bearer ${expectedToken}` });
    expect(token).toEqual('secret_token');
  });

  it('should throw if the app is suspended', async () => {
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 123456789,
          suspended_by: {
            login: 'admin',
          },
          repository_selection: 'all',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    await expect(
      github.getCredentials({
        url: 'https://github.com/backstage',
      }),
    ).rejects.toThrow('The GitHub application for 123456789 is suspended');
  });

  it('should return the default token when the call to github return a status that is not recognized', async () => {
    octokit.apps.listInstallations.mockRejectedValue({
      status: 404,
      message: 'NotFound',
    });

    await expect(
      github.getCredentials({
        url: 'https://github.com/backstage',
      }),
    ).rejects.toEqual({ status: 404, message: 'NotFound' });
  });

  it('should return the default token if no app is configured', async () => {
    const githubProvider = CustomSingleInstanceGithubCredentialsProvider.create(
      {
        host: 'github.com',
        apps: [],
        token: 'fallback_token',
      },
    );

    await expect(
      githubProvider.getCredentials({
        url: 'https://github.com/404/foobar',
      }),
    ).resolves.toEqual(expect.objectContaining({ token: 'fallback_token' }));
  });

  it('should return the configured token if there are no installations', async () => {
    const githubProvider = CustomSingleInstanceGithubCredentialsProvider.create(
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
    );
    octokit.apps.listInstallations.mockResolvedValue({
      data: [],
    } as unknown as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    await expect(
      githubProvider.getCredentials({
        url: 'https://github.com/backstage',
      }),
    ).resolves.toEqual(expect.objectContaining({ token: 'hardcoded_token' }));
  });

  it('should return undefined if no token or apps are configured', async () => {
    const githubProvider = CustomSingleInstanceGithubCredentialsProvider.create(
      {
        host: 'github.com',
      },
    );

    await expect(
      githubProvider.getCredentials({
        url: 'https://github.com/backstage',
      }),
    ).resolves.toEqual({ headers: undefined, token: undefined, type: 'token' });
  });

  it('should to create a token for the organization ignoring case sensitive', async () => {
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'all',
          account: {
            login: 'BACKSTAGE',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    const { token, headers } = await github.getCredentials({
      url: 'https://github.com/backstage',
    });

    expect(headers).toEqual({ Authorization: 'Bearer secret_token' });
    expect(token).toEqual('secret_token');
  });

  it('should not throw when paginate response is an array of repositories', async () => {
    const repoName = 'foobar';
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'all',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
        repository_selection: 'selected',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    octokit.apps.listReposAccessibleToInstallation.mockReturnValue({
      data: [{ name: repoName }],
    } as unknown as RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']);

    await expect(
      github.getCredentials({
        url: `https://github.com/backstage/${repoName}`,
      }),
    ).resolves.not.toThrow();
  });

  it('should not throw when paginate response is an object with a property containing an array of repositories', async () => {
    const repoName = 'foobar';
    octokit.apps.listInstallations.mockResolvedValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'all',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
      data: {
        expires_at: DateTime.local().plus({ hours: 1 }).toString(),
        token: 'secret_token',
        repository_selection: 'selected',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    octokit.apps.listReposAccessibleToInstallation.mockReturnValue({
      data: {
        repositories: [{ name: repoName }],
      },
    } as RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']);

    await expect(
      github.getCredentials({
        url: `https://github.com/backstage/${repoName}`,
      }),
    ).resolves.not.toThrow();
  });

  it('should expire access token cache when less than 10 mins before token expires', async () => {
    octokit.apps.listInstallations.mockReturnValue({
      headers: {
        etag: '123',
      },
      data: [
        {
          id: 1,
          repository_selection: 'all',
          account: {
            login: 'backstage',
          },
        },
      ],
    } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

    octokit.apps.createInstallationAccessToken.mockReturnValue({
      data: {
        expires_at: DateTime.local()
          .plus({ minutes: 9, seconds: 59, milliseconds: 999 })
          .toString(),
        token: 'secret_token',
      },
    } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

    await github.getCredentials({ url: 'https://github.com/backstage' });
    await github.getCredentials({ url: 'https://github.com/backstage' });

    expect(octokit.apps.listInstallations.mock.calls.length).toBe(2);
    expect(octokit.apps.createInstallationAccessToken.mock.calls.length).toBe(
      2,
    );
  });

  describe('CustomSingleInstanceGithubCredentialsProvider #GetAllCredentials Tests', () => {
    it('should return a list of access tokens for all app installations for an owner and the PAT token', async () => {
      const multipleGithubApps =
        CustomSingleInstanceGithubCredentialsProvider.create({
          host: 'github.com',
          token: 'ghp_pat-token',
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
              privateKey: 'privateKey_2',
              webhookSecret: '456',
              clientId: 'CLIENT_ID_2',
              clientSecret: 'CLIENT_SECRET_2',
            },
          ],
        });
      octokit.apps.listInstallations.mockReturnValue({
        headers: {
          etag: '123',
        },
        data: [
          {
            id: 1,
            repository_selection: 'all',
            account: {
              login: 'backstage',
            },
          },
        ],
      } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

      octokit.apps.createInstallationAccessToken.mockReturnValue({
        data: {
          expires_at: DateTime.local().plus({ minutes: 15 }).toString(),
          token: 'secret_token',
        },
      } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

      const response = await multipleGithubApps.getAllCredentials({
        host: 'github.com',
      });
      const expected_response = [
        {
          headers: { Authorization: `Bearer ghp_pat-token` },
          token: 'ghp_pat-token',
          type: 'token',
        },
        {
          headers: { Authorization: `Bearer secret_token` },
          token: 'secret_token',
          type: 'app',
          appId: 1,
        },
        {
          headers: { Authorization: `Bearer secret_token` },
          token: 'secret_token',
          type: 'app',
          appId: 2,
        },
      ];
      expect(response).toEqual(expected_response);
    });
    it('should return errors in the access token list if any occur when grabbing all credentials', async () => {
      const multipleGithubApps =
        CustomSingleInstanceGithubCredentialsProvider.create({
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
              privateKey: 'privateKey_2',
              webhookSecret: '456',
              clientId: 'CLIENT_ID_2',
              clientSecret: 'CLIENT_SECRET_2',
            },
            {
              appId: 3,
              privateKey: 'privateKey_3',
              webhookSecret: '789',
              clientId: 'CLIENT_ID_3',
              clientSecret: 'CLIENT_SECRET_3',
            },
          ],
        });
      octokit.apps.listInstallations
        .mockReturnValueOnce({
          headers: {
            etag: '123',
          },
          data: [
            {
              id: 1,
              repository_selection: 'all',
              account: {
                login: 'backstage',
              },
            },
          ],
        } as RestEndpointMethodTypes['apps']['listInstallations']['response'])
        .mockImplementationOnce(() => {
          const err = new Error('Some error occurred');
          err.name = 'SomeError';
          throw err;
        })
        .mockImplementationOnce(() => {
          const err = new Error('No app installation found for backstage in 3');
          err.name = 'NotFoundError';
          throw err;
        });

      octokit.apps.createInstallationAccessToken.mockReturnValue({
        data: {
          expires_at: DateTime.local().plus({ minutes: 15 }).toString(),
          token: 'secret_token',
        },
      } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

      const response = await multipleGithubApps.getAllCredentials({
        host: 'github.com',
      });

      // The expected errors
      const someError = new Error('Some error occurred');
      someError.name = 'SomeError';
      const notFoundError = new Error(
        'No app installation found for backstage in 3',
      );
      notFoundError.name = 'NotFoundError';

      const expected_response = [
        {
          headers: { Authorization: `Bearer secret_token` },
          token: 'secret_token',
          type: 'app',
          appId: 1,
        },
        {
          type: 'app',
          error: someError,
          appId: 2,
        },
        {
          type: 'app',
          error: notFoundError,
          appId: 3,
        },
      ];

      expect(response).toEqual(expected_response);
    });
  });
});

describe('CustomGithubCredentialsProvider tests', () => {
  let integrations: ScmIntegrations;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    integrations = ScmIntegrations.fromConfig(
      new ConfigReader({
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
            {
              host: 'grithub.com',
              token: 'hardcoded_token_2',
            },
          ],
        },
      }),
    );
  });

  describe('.create', () => {
    it('passes the config through to the custom provider', () => {
      jest.spyOn(CustomSingleInstanceGithubCredentialsProvider, 'create');
      CustomGithubCredentialsProvider.fromIntegrations(integrations);
      const githubIntegration =
        integrations.github.byHost('github.com')?.config;
      const grithubIntegration =
        integrations.github.byHost('grithub.com')?.config;
      expect(
        CustomSingleInstanceGithubCredentialsProvider.create,
      ).toHaveBeenCalledWith(githubIntegration);
      expect(
        CustomSingleInstanceGithubCredentialsProvider.create,
      ).toHaveBeenCalledWith(grithubIntegration);
    });
  });

  describe('#getCredentials', () => {
    it('returns the access tokens from the credential provider', async () => {
      octokit.apps.listInstallations.mockResolvedValue({
        headers: {
          etag: '123',
        },
        data: [
          {
            id: 1,
            repository_selection: 'selected',
            account: {
              login: 'backstage',
            },
          },
        ],
      } as RestEndpointMethodTypes['apps']['listInstallations']['response']);
      octokit.apps.createInstallationAccessToken.mockResolvedValueOnce({
        data: {
          expires_at: DateTime.local().plus({ hours: 1 }).toString(),
          token: 'secret_token',
        },
      } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);

      const provider =
        CustomGithubCredentialsProvider.fromIntegrations(integrations);
      const githubCredentials = await provider.getCredentials({
        url: 'https://github.com/blah',
      });
      const gitHubAppCredentials = await provider.getCredentials({
        url: 'https://github.com/backstage',
      });
      const gritHubCredentials = await provider.getCredentials({
        url: 'https://grithub.com/blah',
      });

      expect(githubCredentials).toEqual({
        type: 'app',
        token: 'secret_token',
        headers: {
          Authorization: 'Bearer secret_token',
        },
      });
      expect(gitHubAppCredentials).toEqual({
        type: 'token',
        token: 'hardcoded_token',
        headers: {
          Authorization: 'Bearer hardcoded_token',
        },
      });

      expect(gritHubCredentials).toEqual({
        type: 'token',
        token: 'hardcoded_token_2',
        headers: {
          Authorization: 'Bearer hardcoded_token_2',
        },
      });
    });

    it('throws an error if an host without a corresponding github integration is provided', async () => {
      const provider =
        CustomGithubCredentialsProvider.fromIntegrations(integrations);
      await expect(
        provider.getCredentials({
          url: 'https://invalid.com/test',
        }),
      ).rejects.toThrow(
        'There is no GitHub integration that matches https://invalid.com/test. Please add a configuration for an integration.',
      );
    });
  });
  describe('#getAllCredentials', () => {
    it('returns the access tokens for all installed apps and tokens on a github org/user', async () => {
      const customIntegrations = ScmIntegrations.fromConfig(
        new ConfigReader({
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
                    privateKey: 'privateKey_2',
                    webhookSecret: '456',
                    clientId: 'CLIENT_ID_2',
                    clientSecret: 'CLIENT_SECRET_2',
                  },
                  {
                    appId: 3,
                    privateKey: 'privateKey_3',
                    webhookSecret: '789',
                    clientId: 'CLIENT_ID_3',
                    clientSecret: 'CLIENT_SECRET_3',
                  },
                ],
                token: 'hardcoded_token',
              },
            ],
          },
        }),
      );
      octokit.apps.listInstallations
        .mockReturnValueOnce({
          headers: {
            etag: '123',
          },
          data: [
            {
              id: 1,
              repository_selection: 'all',
              account: {
                login: 'backstage',
              },
            },
          ],
        } as RestEndpointMethodTypes['apps']['listInstallations']['response'])
        .mockImplementationOnce(() => {
          const err = new Error('Some error occurred');
          err.name = 'SomeError';
          throw err;
        })
        .mockReturnValue({
          headers: {
            etag: '123',
          },
          data: [
            {
              id: 2,
              repository_selection: 'all',
              account: {
                login: 'not-backstage',
              },
            },
          ],
        } as RestEndpointMethodTypes['apps']['listInstallations']['response']);

      octokit.apps.createInstallationAccessToken.mockReturnValue({
        data: {
          expires_at: DateTime.local().plus({ minutes: 15 }).toString(),
          token: 'secret_token',
        },
      } as RestEndpointMethodTypes['apps']['createInstallationAccessToken']['response']);
      const provider =
        CustomGithubCredentialsProvider.fromIntegrations(customIntegrations);

      const githubAccessTokens = await provider.getAllCredentials({
        host: 'github.com',
      });
      // The expected errors
      const someError = new Error('Some error occurred');
      someError.name = 'SomeError';
      const notFoundError = new Error(
        'No app installation found for backstage in 3',
      );
      notFoundError.name = 'NotFoundError';

      const expected_response = [
        {
          headers: { Authorization: 'Bearer hardcoded_token' },
          token: 'hardcoded_token',
          type: 'token',
        },
        {
          headers: { Authorization: 'Bearer secret_token' },
          token: 'secret_token',
          type: 'app',
          appId: 1,
        },
        {
          type: 'app',
          error: someError,
          appId: 2,
        },
        {
          type: 'app',
          headers: {
            Authorization: 'Bearer secret_token',
          },
          token: 'secret_token',
          appId: 3,
        },
      ];
      expect(githubAccessTokens).toEqual(expected_response);
    });
    it('throws an error if an host without a corresponding github integration is provided', async () => {
      const provider =
        CustomGithubCredentialsProvider.fromIntegrations(integrations);
      await expect(
        provider.getAllCredentials({
          host: 'invalid.com',
        }),
      ).rejects.toThrow(
        'There is no GitHub integration that matches invalid.com. Please add a configuration for an integration.',
      );
    });
  });
});
