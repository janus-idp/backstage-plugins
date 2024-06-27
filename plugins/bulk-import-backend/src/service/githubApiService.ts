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
import {
  GithubCredentials,
  GithubIntegrationConfig,
  ScmIntegrations,
} from '@backstage/integration';

import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import { Octokit } from '@octokit/rest';
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
import { DefaultPageNumber, DefaultPageSize } from './handlers/handlers';

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
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<{ totalCount?: number }> {
    let totalCount: number | undefined;
    try {
      const resp = await octokit.apps.listReposAccessibleToInstallation({
        page: pageNumber,
        per_page: pageSize,
      });
      const repos = resp?.data?.repositories ?? resp?.data;
      repos?.forEach(repo => {
        const githubRepo: GithubRepository = {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
        };
        repositories.set(githubRepo.full_name, githubRepo);
      });
      totalCount = resp?.data?.total_count;
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
    return { totalCount };
  }

  /**
   * Adds the user or organization repositories accessible by the github token to the provided repositories Map<string, GithubRepository> if they're owned by the specified owner
   * If any errors occurs, adds them to the provided errors Map<number, GithubRepoFetchError>
   */
  private async addGithubTokenRepositories(
    octokit: Octokit,
    credential: GithubCredentials,
    repositories: Map<string, GithubRepository>,
    errors: Map<number, GithubRepoFetchError>,
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<{ totalCount?: number }> {
    let totalCount: number | undefined;
    try {
      /**
       * The listForAuthenticatedUser endpoint will grab all the repositories the github token has explicit access to.
       * These would include repositories they own, repositories where they are a collaborator,
       * and repositories that they can access through an organization membership.
       */
      const resp = await octokit.rest.repos.listForAuthenticatedUser({
        page: pageNumber,
        per_page: pageSize,
        sort: 'full_name',
        direction: 'asc',
      });
      resp?.data?.forEach(repo => {
        const githubRepo: GithubRepository = {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
        };
        repositories.set(githubRepo.full_name, githubRepo);
      });

      totalCount = await this.computeTotalRepoCountFromGitHubToken(
        octokit,
        resp,
      );
    } catch (err) {
      this.logger.error(
        `Fetching repositories with token from token failed with ${err}`,
      );
      const credentialError = this.createCredentialError(
        credential,
        err as Error,
      );
      if (credentialError) {
        errors.set(-1, credentialError);
      }
    }
    return { totalCount };
  }

  private async computeTotalRepoCountFromGitHubToken(
    octokit: Octokit,
    resp: RestEndpointMethodTypes['repos']['listForAuthenticatedUser']['response'],
  ): Promise<number | undefined> {
    // There is no direct way to get the total count of repositories other than using octokit.paginate,
    // but will make us retrieve all pages, thus increasing our response time.
    // Workaround here is to analyze the headers, and get the link to the last page.
    const pageSize = resp?.data?.length;
    const linkHeader = resp?.headers?.link;
    if (!linkHeader) {
      this.logger.debug(
        'No link header found in response from listForAuthenticatedUser GH endpoint => returning current page size',
      );
      return pageSize;
    }
    const lastPageLink = linkHeader
      .split(',')
      .find(s => s.includes('rel="last"'));
    if (!lastPageLink) {
      this.logger.debug(
        "No rel='last' link found in response headers from listForAuthenticatedUser GH endpoint => returning current page size",
      );
      return pageSize;
    }
    const match = lastPageLink.match(/page=(\d+).*$/);
    if (!match || match.length < 2) {
      this.logger.debug(
        "Unable to extract page number from rel='last' link found in response headers from listForAuthenticatedUser GH endpoint => returning current page size",
      );
      return pageSize;
    }

    const lastPageNumber = parseInt(match[1], 10);
    // Fetch the last page to count its items, as it might contain fewer than the requested size
    const lastPageResponse = await octokit.repos.listForAuthenticatedUser({
      page: lastPageNumber,
      per_page: 1,
    });
    return pageSize
      ? (lastPageNumber - 1) * pageSize + lastPageResponse.data.length
      : undefined;
  }

  /**
   * Returns GithubRepositoryResponse containing:
   *   - a list of unique repositories the github integrations have access to
   *   - a list of errors encountered by each app and/or token (if any exist)
   */
  async getRepositoriesFromIntegrations(
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<GithubRepositoryResponse> {
    const ghConfigs = this.verifyAndGetIntegrations();

    const credentialsByConfig =
      await this.getCredentialsFromIntegrations(ghConfigs);
    const repositories = new Map<string, GithubRepository>();
    const errors = new Map<number, GithubRepoFetchError>();
    let totalCount = 0;
    for (const [ghConfig, credentials] of credentialsByConfig) {
      this.logger.debug(
        `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
      );
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

        const octokit = new Octokit({
          baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
          auth: credential.token,
        });

        let resp: { totalCount?: number };
        if (isGithubAppCredential(credential)) {
          resp = await this.addGithubAppRepositories(
            octokit,
            credential,
            repositories,
            errors,
            pageNumber,
            pageSize,
          );
        } else {
          resp = await this.addGithubTokenRepositories(
            octokit,
            credential,
            repositories,
            errors,
            pageNumber,
            pageSize,
          );
        }
        this.logger.debug(
          `Got ${resp.totalCount} repo(s) for ${ghConfig.host}`,
        );
        if (resp.totalCount) {
          totalCount += resp.totalCount;
        }
      }
    }
    return {
      repositories: Array.from(repositories.values()),
      errors: Array.from(errors.values()),
      totalCount: totalCount,
    };
  }

  private async getCredentialsFromIntegrations(
    ghConfigs: GithubIntegrationConfig[],
  ) {
    const credentialsByConfig = new Map<
      GithubIntegrationConfig,
      ExtendedGithubCredentials[]
    >();
    for (const ghConfig of ghConfigs) {
      const creds = await this.githubCredentialsProvider.getAllCredentials({
        host: ghConfig.host,
      });
      credentialsByConfig.set(ghConfig, creds);
    }
    return credentialsByConfig;
  }

  private verifyAndGetIntegrations() {
    const ghConfigs = this.integrations.github
      .list()
      .map(ghInt => ghInt.config);
    if (ghConfigs.length === 0) {
      this.logger.debug(
        'No GitHub Integration in config => returning an empty list of repositories.',
      );
      throw new Error(
        "Looks like there is no GitHub Integration in config. Please add a configuration entry under 'integrations.github",
      );
    }
    return ghConfigs;
  }

  async findImportOpenPr(
    logger: Logger,
    input: {
      repoUrl: string;
    },
  ): Promise<{
    prNum?: number;
    prUrl?: string;
  }> {
    const ghConfig = this.integrations.github.byUrl(input.repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(`Could not find GH integration from ${input.repoUrl}`);
    }

    const gitUrl = gitUrlParse(input.repoUrl);
    const owner = gitUrl.organization;
    const repo = gitUrl.name;

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
    if (credentials.length === 0) {
      throw new Error(`No credentials for GH integration`);
    }

    const branchName = 'chore/janus-idp/backstage-bulk-import';
    for (const credential of credentials) {
      if ('error' in credential) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError = this.createCredentialError(credential);
          if (credentialError) {
            logger.debug(`${credential.appId}: ${credentialError}`);
          }
        }
        continue;
      }

      const octo = new Octokit({
        baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
        auth: credential.token,
      });

      try {
        return await this.findOpenPRForBranch(
          logger,
          octo,
          owner,
          repo,
          branchName,
        );
      } catch (error) {
        logger.warn(`Error fetching pull requests: ${error}`);
      }
    }
    return {};
  }

  private async findOpenPRForBranch(
    logger: Logger,
    octo: Octokit,
    owner: string,
    repo: string,
    branchName: string,
  ): Promise<{
    prNum?: number;
    prUrl?: string;
  }> {
    try {
      const response = await octo.rest.pulls.list({
        owner: owner,
        repo: repo,
        state: 'open',
      });
      for (const pull of response.data) {
        if (pull.head.ref === branchName) {
          return {
            prNum: pull.number,
            prUrl: pull.html_url,
          };
        }
      }
    } catch (error) {
      logger.warn(`Error fetching pull requests: ${error}`);
    }
    return {};
  }

  private async createOrUpdateFileInBranch(
    octo: Octokit,
    owner: string,
    repo: string,
    branchName: string,
    fileName: string,
    fileContent: string,
  ): Promise<void> {
    try {
      const { data: existingFile } = await octo.rest.repos.getContent({
        owner: owner,
        repo: repo,
        path: fileName,
        ref: branchName,
      });
      // Response can either be a directory (array of files) or a single file element. In this case, we ensure it has the sha property to update it.
      if (Array.isArray(existingFile) || !('sha' in existingFile)) {
        throw new Error(
          `The content at path ${fileName} is not a file or the response from GitHub does not contain the 'sha' property.`,
        );
      }
      // If the file already exists, update it
      await octo.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: fileName,
        message: `Add ${fileName} config file`,
        content: btoa(fileContent),
        sha: existingFile.sha,
        branch: branchName,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // If the file does not exist, create it
        await octo.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: fileName,
          message: `Add ${fileName} config file`,
          content: btoa(fileContent),
          branch: branchName,
        });
      } else {
        throw error;
      }
    }
  }

  async submitPrToRepo(
    logger: Logger,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
      prTitle: string;
      prBody: string;
      catalogInfoContent: string;
    },
  ): Promise<{
    prUrl?: string;
    prNumber?: number;
    hasChanges?: boolean;
    errors?: string[];
  }> {
    const ghConfig = this.integrations.github.byUrl(input.repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(`Could not find GH integration from ${input.repoUrl}`);
    }

    const owner = input.gitUrl.organization;
    const repo = input.gitUrl.name;

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
    if (credentials.length === 0) {
      throw new Error(`No credentials for GH integration`);
    }

    const branchName = 'chore/janus-idp/backstage-bulk-import';
    const fileName = 'catalog-info.yaml';
    const errors: any[] = [];
    for (const credential of credentials) {
      if ('error' in credential) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError = this.createCredentialError(credential);
          if (credentialError) {
            logger.debug(`${credential.appId}: ${credentialError}`);
          }
        }
        continue;
      }
      // const baseUrl =
      //     ghHost === 'github.com'
      //         ? 'https://api.github.com'
      //         : `https://${ghHost}/api/v3`;
      const octo = new Octokit({
        baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
        auth: credential.token,
      });
      try {
        const existingPrForBranch = await this.findOpenPRForBranch(
          logger,
          octo,
          owner,
          repo,
          branchName,
        );

        const repoData = await octo.rest.repos.get({
          owner,
          repo,
        });
        const parentRef = await octo.rest.git.getRef({
          owner,
          repo,
          ref: `heads/${repoData.data.default_branch}`,
        });
        if (existingPrForBranch.prNum) {
          await this.createOrUpdateFileInBranch(
            octo,
            owner,
            repo,
            branchName,
            fileName,
            input.catalogInfoContent,
          );
          const pullRequestResponse = await octo.rest.pulls.update({
            owner,
            repo,
            pull_number: existingPrForBranch.prNum,
            title: input.prTitle,
            body: input.prBody,
            head: branchName,
            base: repoData.data.default_branch,
          });
          return {
            prNumber: existingPrForBranch.prNum,
            prUrl: pullRequestResponse.data.html_url,
          };
        }

        try {
          await octo.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${branchName}`,
          });
        } catch (error: any) {
          if (error.status === 404) {
            await octo.rest.git.createRef({
              owner,
              repo,
              ref: `refs/heads/${branchName}`,
              sha: parentRef.data.object.sha,
            });
          } else {
            throw error;
          }
        }

        await this.createOrUpdateFileInBranch(
          octo,
          owner,
          repo,
          branchName,
          fileName,
          input.catalogInfoContent,
        );

        const pullRequestResponse = await octo.rest.pulls.create({
          owner,
          repo,
          title: input.prTitle,
          body: input.prBody,
          head: branchName,
          base: repoData.data.default_branch,
        });
        const prNum = pullRequestResponse.data.number;

        // Check if PR has actual file changes - if no changes, it means that there is no diff compared to the base branch, so the PR can be closed.
        const prFiles = await octo.rest.pulls.listFiles({
          owner,
          repo,
          pull_number: prNum,
          page: 1,
          per_page: 1,
        });
        const hasChanges = prFiles.data.length > 0;
        if (!hasChanges) {
          await this.closePRWithComment(
            octo,
            owner,
            repo,
            prNum,
            `Closing this PR because it contains no additional change compared to the base branch.`,
          );
        }

        return {
          prNumber: pullRequestResponse.data.number,
          prUrl: pullRequestResponse.data.html_url,
          hasChanges,
        };
      } catch (e: any) {
        logger.warn(`Couldn't create PR in ${input.repoUrl}: ${e}`);
        errors.push(e.message);
      }
    }

    logger.warn(
      `Tried all possible GitHub credentials, but could not create PR in ${input.repoUrl}. Please try again later...`,
    );

    return {
      errors: errors,
    };
  }

  async closePR(
    logger: Logger,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
      comment: string;
    },
  ) {
    const ghConfig = this.integrations.github.byUrl(input.repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(`Could not find GH integration from ${input.repoUrl}`);
    }

    const owner = input.gitUrl.organization;
    const repo = input.gitUrl.name;

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
    if (credentials.length === 0) {
      throw new Error(`No credentials for GH integration`);
    }

    const branchName = 'chore/janus-idp/backstage-bulk-import';
    const errors: any[] = [];
    for (const credential of credentials) {
      if ('error' in credential) {
        if (credential.error?.name !== 'NotFoundError') {
          this.logger.error(
            `Obtaining the Access Token Github App with appId: ${credential.appId} failed with ${credential.error}`,
          );
          const credentialError = this.createCredentialError(credential);
          if (credentialError) {
            logger.debug(`${credential.appId}: ${credentialError}`);
          }
        }
        continue;
      }
      const octo = new Octokit({
        baseUrl: ghConfig.apiBaseUrl ?? 'https://api.github.com',
        auth: credential.token,
      });
      try {
        const existingPrForBranch = await this.findOpenPRForBranch(
          logger,
          octo,
          owner,
          repo,
          branchName,
        );
        if (existingPrForBranch.prNum) {
          await this.closePRWithComment(
            octo,
            owner,
            repo,
            existingPrForBranch.prNum,
            input.comment,
          );
          return;
        }
      } catch (e: any) {
        logger.warn(`Couldn't close PR in ${input.repoUrl}: ${e}`);
        errors.push(e.message);
      }
    }
  }

  private async closePRWithComment(
    octo: Octokit,
    owner: string,
    repo: string,
    prNum: number,
    comment: string,
  ) {
    await octo.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNum,
      body: comment,
    });
    await octo.rest.pulls.update({
      owner,
      repo,
      pull_number: prNum,
      state: 'closed',
    });
  }
}
