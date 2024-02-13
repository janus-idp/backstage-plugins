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

import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';

import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CustomGithubCredentialsProvider } from '../helpers/GithubAppManager';
import {
  GithubRepoFetchError,
  GithubRepository,
  GithubRepositoryResponse,
  isGithubAppCredential,
} from '../types';

export class GithubApiService {
  private readonly logger: Logger;
  private readonly integrations: ScmIntegrations;

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    this.integrations = ScmIntegrations.fromConfig(config);
  }

  async getGithubRepositories(
    gitOwner: gitUrlParse.GitUrl,
  ): Promise<GithubRepositoryResponse> {
    const gitHubConfig = this.integrations.github.byUrl(gitOwner.href)?.config;
    const githubCredentialsProvider =
      CustomGithubCredentialsProvider.fromIntegrations(this.integrations);
    if (!gitHubConfig) {
      throw new Error(
        `There is no GitHub integration that matches ${gitOwner.href}. Please add a configuration entry for it under integrations.github.`,
      );
    }
    const credentials = await githubCredentialsProvider.getAllCredentials({
      url: `${gitOwner.href}`,
    });

    let repositories = new Map<string, GithubRepository>();
    let errors = new Map<number, GithubRepoFetchError>();
    for (const credential of credentials) {
      if ('error' in credential && credential.error) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError: GithubRepoFetchError = {
            appId: credential.appId,
            type: 'app',
            error: {
              name: credential.error.name,
              message: credential.error.message,
            },
          };
          errors.set(credential.appId, credentialError);
        }
        continue;
      }
      // Might want a better way to obtain the API base url of the github enterprise instance to query
      const baseUrl =
        gitOwner.resource === 'github.com'
          ? 'https://api.github.com'
          : `https://${gitOwner.resource}/api/v3`;
      const octokit = new Octokit({
        baseUrl,
        auth: credential.token,
      });

      if (isGithubAppCredential(credential)) {
        try {
          const repos = await octokit.paginate(
            octokit.apps.listReposAccessibleToInstallation,
          );
          // The return type of the paginate method is incorrect for apps.listReposAccessibleToInstallation
          const accessibleRepos: RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']['data']['repositories'] =
            repos.repositories ?? repos;

          accessibleRepos.forEach(repo => {
            const githubRepo: GithubRepository = {
              name: repo.name,
              full_name: repo.full_name,
              url: repo.url,
              html_url: repo.html_url,
            };
            repositories.set(githubRepo.full_name, githubRepo);
          });
        } catch (err) {
          this.logger.error(
            `Fetching repositories with access token for github app ${credential.appId}, failed with ${err}`,
          );
          const credentialError: GithubRepoFetchError = {
            appId: credential.appId,
            type: 'app',
            error: {
              name: (err as Error).name,
              message: (err as Error).message,
            },
          };
          errors.set(credential.appId, credentialError);
        }
      } else {
        // For PATs, we will need to determine whether the owner is an organization or user to be able to query the correct API
        // The owner, user and organization field of the gitUrlParse.GitUrl object will be "" if no repository path is provided
        // The gitUrlParse.GitUrl object will have the name field set to the user or organization if no repository is provided
        let account: RestEndpointMethodTypes['users']['getByUsername']['response']['data'];
        try {
          account = (
            await octokit.rest.users.getByUsername({
              username: gitOwner.name,
            })
          ).data;
        } catch (err) {
          this.logger.error(`Fetching account with token failed with ${err}`);
          const credentialError: GithubRepoFetchError = {
            type: 'token',
            error: {
              name: (err as Error).name,
              message: (err as Error).message,
            },
          };
          errors.set(-1, credentialError);
          continue;
        }
        if (account.type === 'User') {
          try {
            const repos = await octokit.paginate(
              octokit.rest.repos.listForAuthenticatedUser,
            );
            repos.forEach(repo => {
              const githubRepo: GithubRepository = {
                name: repo.name,
                full_name: repo.full_name,
                url: repo.url,
                html_url: repo.html_url,
              };
              repositories.set(githubRepo.full_name, githubRepo);
            });
          } catch (err) {
            this.logger.error(
              `Fetching repositories with token for authenticated user failed with ${err}`,
            );
            const credentialError: GithubRepoFetchError = {
              type: 'token',
              error: {
                name: (err as Error).name,
                message: (err as Error).message,
              },
            };
            errors.set(-1, credentialError);
            continue;
          }
        }
        // Otherwise type will be "Organization"
        else {
          try {
            const repos = await octokit.paginate(
              octokit.rest.repos.listForOrg,
              {
                org: gitOwner.name,
              },
            );
            repos.forEach(repo => {
              const githubRepo: GithubRepository = {
                name: repo.name,
                full_name: repo.full_name,
                url: repo.url,
                html_url: repo.html_url,
              };
              repositories.set(githubRepo.full_name, githubRepo);
            });
          } catch (err) {
            this.logger.error(
              `Fetching repositories with token from org ${gitOwner.name} failed with ${err}`,
            );
            const credentialError: GithubRepoFetchError = {
              type: 'token',
              error: {
                name: (err as Error).name,
                message: (err as Error).message,
              },
            };
            errors.set(-1, credentialError);
            continue;
          }
        }
      }
    }
    return {
      repositories: Array.from(repositories.values()),
      errors: Array.from(errors.values()),
    };
  }
}
