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
import { GithubCredentials, ScmIntegrations } from '@backstage/integration';

import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CustomGithubCredentialsProvider } from '../helpers';
import {
  ExtendedGithubCredentials,
  GithubAppCredentials,
  GithubRepoFetchError,
  GithubRepository,
  GithubRepositoryResponse,
  isGithubAppCredential,
} from '../types';

export class GithubApiService {
  private readonly logger: Logger;
  private readonly integrations: ScmIntegrations;
  private readonly githubCredentialsProvider: CustomGithubCredentialsProvider;

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    this.integrations = ScmIntegrations.fromConfig(config);
    this.githubCredentialsProvider =
      CustomGithubCredentialsProvider.fromIntegrations(this.integrations);
  }

  /**
   * Creates the GithubRepoFetchError to be stored in the returned errors array of the returned GithubRepositoryResponse object
   */
  private createCredentialError(
    credential: ExtendedGithubCredentials,
    err?: Error,
  ): GithubRepoFetchError | undefined {
    if (err) {
      if (isGithubAppCredential(credential)) {
        return {
          appId: credential.appId,
          type: 'app',
          error: {
            name: err.name,
            message: err.message,
          },
        };
      }
      return {
        type: 'token',
        error: {
          name: err.name,
          message: err.message,
        },
      };
    }
    if ('error' in credential) {
      return {
        appId: credential.appId,
        type: 'app',
        error: {
          name: credential.error.name,
          message: credential.error.message,
        },
      };
    }
    return undefined;
  }

  /**
   * Adds the repositories accessible by the provided github app to the provided repositories Map<string, GithubRepository>
   * If any errors occurs, adds them to the provided errors Map<number, GithubRepoFetchError>
   */
  private async addGithubAppRepositories(
    octokit: Octokit,
    credential: GithubAppCredentials,
    repositories: Map<string, GithubRepository>,
    errors: Map<number, GithubRepoFetchError>,
  ): Promise<void> {
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
          default_branch: repo.default_branch,
        };
        repositories.set(githubRepo.full_name, githubRepo);
      });
    } catch (err) {
      this.logger.error(
        `Fetching repositories with access token for github app ${credential.appId}, failed with ${err}`,
      );
      const credentialError = this.createCredentialError(
        credential,
        err as Error,
      );
      if (credentialError) {
        errors.set(credential.appId, credentialError);
      }
    }
  }

  /**
   * Queries the Github API for users or organizations with the provided accountName and returns their information
   */
  async getGithubAccountDetails(
    octokit: Octokit,
    credential: GithubCredentials,
    accountName: string,
    errors: Map<number, GithubRepoFetchError>,
  ): Promise<
    | RestEndpointMethodTypes['users']['getByUsername']['response']['data']
    | undefined
  > {
    try {
      const account = (
        await octokit.rest.users.getByUsername({
          username: accountName,
        })
      ).data;
      return account;
    } catch (err) {
      this.logger.error(`Fetching account with token failed with ${err}`);
      const credentialError = this.createCredentialError(
        credential,
        err as Error,
      );
      if (credentialError) {
        errors.set(-1, credentialError);
      }
      return undefined;
    }
  }

  /**
   * Adds the user or organization repositories accessible by the github token to the provided repositories Map<string, GithubRepository> if they're owned by the specified owner
   * If any errors occurs, adds them to the provided errors Map<number, GithubRepoFetchError>
   */
  private async addGithubTokenRepositories(
    octokit: Octokit,
    credential: GithubCredentials,
    accountName: string,
    repositories: Map<string, GithubRepository>,
    errors: Map<number, GithubRepoFetchError>,
  ): Promise<void> {
    try {
      const account = await this.getGithubAccountDetails(
        octokit,
        credential,
        accountName,
        errors,
      );
      if (account?.type === 'User') {
        const repos = await octokit.paginate(
          octokit.rest.repos.listForAuthenticatedUser,
        );
        repos.forEach(repo => {
          /**
           * The listForAuthenticatedUser endpoint will grab all the repositories the github token has explicit access to.
           * These would include repositories they own, repositories where they are a collaborator,
           * and repositories that they can access through an organization membership.
           * A filter is needed to grab only the repositories for the target owner
           */
          if (repo.owner.login === accountName) {
            const githubRepo: GithubRepository = {
              name: repo.name,
              full_name: repo.full_name,
              url: repo.url,
              html_url: repo.html_url,
              default_branch: repo.default_branch,
            };
            repositories.set(githubRepo.full_name, githubRepo);
          }
        });
      }
      // Otherwise is an Organization
      else if (account?.type === 'Organization') {
        const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
          org: accountName,
        });
        repos.forEach(repo => {
          const githubRepo: GithubRepository = {
            name: repo.name,
            full_name: repo.full_name,
            url: repo.url,
            html_url: repo.html_url,
            default_branch: repo.default_branch!,
          };
          repositories.set(githubRepo.full_name, githubRepo);
        });
      }
    } catch (err) {
      this.logger.error(
        `Fetching repositories with token from account ${accountName} failed with ${err}`,
      );
      const credentialError = this.createCredentialError(
        credential,
        err as Error,
      );
      if (credentialError) {
        errors.set(-1, credentialError);
      }
    }
  }

  /**
   * @param gitOwner - github user or organization in the form of an HTML url.
   *
   * Returns GithubRepositoryResponse containing:
   *   - a list of unique repositories the github integrations have access to
   *   - a list of errors encountered by each app and/or token (if any exist)
   */
  async getGithubRepositories(
    gitOwner: gitUrlParse.GitUrl,
  ): Promise<GithubRepositoryResponse> {
    const gitHubConfig = this.integrations.github.byUrl(gitOwner.href)?.config;
    if (!gitHubConfig) {
      throw new Error(
        `There is no GitHub integration that matches ${gitOwner.href}. Please add a configuration entry for it under integrations.github.`,
      );
    }

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      url: `${gitOwner.href}`,
    });
    const repositories = new Map<string, GithubRepository>();
    const errors = new Map<number, GithubRepoFetchError>();
    for (const credential of credentials) {
      if ('error' in credential) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError = this.createCredentialError(credential);
          if (credentialError) {
            errors.set(credential.appId, credentialError);
          }
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
        await this.addGithubAppRepositories(
          octokit,
          credential,
          repositories,
          errors,
        );
      } else {
        // For PATs, we will need to determine whether the owner is an organization or user to be able to query the correct API
        // The owner, user and organization field of the gitUrlParse.GitUrl object will be "" if no repository path is provided
        // The gitUrlParse.GitUrl object will have the name field set to the user or organization if no repository is provided

        await this.addGithubTokenRepositories(
          octokit,
          credential,
          gitOwner.name,
          repositories,
          errors,
        );
      }
    }
    return {
      repositories: Array.from(repositories.values()),
      errors: Array.from(errors.values()),
    };
  }
}
