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

import type {
  CacheService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';

import { Octokit } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';

import { getBranchName, getCatalogFilename } from '../catalog/catalogUtils';
import { logErrorIfNeeded } from '../helpers';
import {
  DefaultPageNumber,
  DefaultPageSize,
} from '../service/handlers/handlers';
import { CustomGithubCredentialsProvider } from './GithubAppManager';
import {
  isGithubAppCredential,
  type GithubFetchError,
  type GithubOrganization,
  type GithubOrganizationResponse,
  type GithubRepository,
  type GithubRepositoryResponse,
} from './types';
import { buildOcto } from './utils/ghUtils';
import {
  addGithubAppOrgs,
  addGithubTokenOrgs,
  getAllAppOrgs,
} from './utils/orgUtils';
import { closePRWithComment, findOpenPRForBranch } from './utils/prUtils';
import {
  addGithubAppRepositories,
  addGithubTokenOrgRepositories,
  addGithubTokenRepositories,
  createOrUpdateFileInBranch,
  fileExistsInDefaultBranch,
  type ValidatedRepo,
} from './utils/repoUtils';
import {
  executeFunctionOnFirstSuccessfulIntegration,
  getCredentialsForConfig,
  getCredentialsFromIntegrations,
  verifyAndGetIntegrations,
} from './utils/utils';

export class GithubApiService {
  private readonly logger: LoggerService;
  private readonly integrations: ScmIntegrations;
  private readonly githubCredentialsProvider: CustomGithubCredentialsProvider;
  private readonly config: Config;
  // Cache for storing ETags (used for efficient caching of unchanged data returned by GitHub)
  private readonly cache: CacheService;

  constructor(
    logger: LoggerService,
    config: Config,
    cacheService: CacheService,
  ) {
    this.logger = logger;
    this.config = config;
    this.integrations = ScmIntegrations.fromConfig(config);
    this.githubCredentialsProvider =
      CustomGithubCredentialsProvider.fromIntegrations(this.integrations);
    this.cache = cacheService;
  }

  async getRepositoryFromIntegrations(repoUrl: string): Promise<{
    repository?: GithubRepository;
    errors?: GithubFetchError[];
  }> {
    const gitUrl = gitUrlParse(repoUrl);

    const ghConfig = this.integrations.github.byUrl(repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(
        `No GitHub integration config found for repo ${repoUrl}. Please add a configuration entry under 'integrations.github`,
      );
    }

    const credentials = await getCredentialsForConfig(
      this.githubCredentialsProvider,
      ghConfig,
    );
    const errors = new Map<number, GithubFetchError>();
    let repository: GithubRepository | undefined = undefined;
    for (const credential of credentials) {
      const octokit = buildOcto(
        {
          logger: this.logger,
          cache: this.cache,
        },
        { credential, errors, owner: gitUrl.owner },
        ghConfig.apiBaseUrl,
      );
      if (!octokit) {
        continue;
      }
      const resp = await octokit.rest.repos.get({
        owner: gitUrl.owner,
        repo: gitUrl.name,
      });
      const repo = resp?.data;
      if (!repo) {
        continue;
      }
      repository = {
        name: repo.name,
        full_name: repo.full_name,
        url: repo.url,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        updated_at: repo.updated_at,
      };
      break;
    }

    return {
      repository,
      errors: Array.from(errors.values()),
    };
  }

  async getOrganizationsFromIntegrations(
    search?: string,
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<GithubOrganizationResponse> {
    const ghConfigs = verifyAndGetIntegrations(
      {
        logger: this.logger,
      },
      this.integrations,
    );

    const credentialsByConfig = await getCredentialsFromIntegrations(
      this.githubCredentialsProvider,
      ghConfigs,
    );
    const orgs = new Map<string, GithubOrganization>();
    const errors = new Map<number, GithubFetchError>();
    let totalCount = 0;
    for (const [ghConfig, credentials] of credentialsByConfig) {
      this.logger.debug(
        `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
      );
      for (const credential of credentials) {
        const octokit = buildOcto(
          {
            logger: this.logger,
            cache: this.cache,
          },
          { credential, errors },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        let resp: { totalCount?: number } = {};
        if (isGithubAppCredential(credential)) {
          resp = await addGithubAppOrgs(
            {
              logger: this.logger,
              githubCredentialsProvider: this.githubCredentialsProvider,
            },
            octokit,
            ghConfig,
            {
              credentialAccountLogin: credential.accountLogin,
              search,
              orgs,
              errors,
            },
          );
        } else {
          resp = await addGithubTokenOrgs(
            {
              logger: this.logger,
            },
            octokit,
            credential,
            {
              search,
              orgs,
              errors,
              pageNumber,
              pageSize,
            },
          );
        }
        this.logger.debug(`Got ${resp.totalCount} org(s) for ${ghConfig.host}`);
        if (resp.totalCount) {
          totalCount += resp.totalCount;
        }
      }
    }
    if (totalCount < pageSize) {
      totalCount = orgs.size;
    }
    return {
      organizations: Array.from(orgs.values()),
      errors: Array.from(errors.values()),
      totalCount: totalCount,
    };
  }

  async getOrgRepositoriesFromIntegrations(
    orgName: string,
    search?: string,
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<GithubRepositoryResponse> {
    const ghConfigs = verifyAndGetIntegrations(
      {
        logger: this.logger,
      },
      this.integrations,
    );
    const credentialsByConfig = await getCredentialsFromIntegrations(
      this.githubCredentialsProvider,
      ghConfigs,
    );
    const repositories = new Map<string, GithubRepository>();
    const errors = new Map<number, GithubFetchError>();
    let totalCount = 0;
    let orgFetched = false;
    for (const [ghConfig, credentials] of credentialsByConfig) {
      if (orgFetched) {
        break;
      }
      this.logger.debug(
        `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
      );
      for (const credential of credentials) {
        const octokit = buildOcto(
          {
            logger: this.logger,
            cache: this.cache,
          },
          { credential, errors },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        let resp: { totalCount?: number };
        if (isGithubAppCredential(credential)) {
          if (credential.accountLogin !== orgName) {
            continue;
          }
          resp = await addGithubAppRepositories(
            {
              logger: this.logger,
              githubCredentialsProvider: this.githubCredentialsProvider,
            },
            octokit,
            credential,
            ghConfig,
            repositories,
            errors,
            {
              search,
              pageNumber,
              pageSize,
            },
          );
        } else {
          resp = await addGithubTokenOrgRepositories(
            {
              logger: this.logger,
            },
            octokit,
            credential,
            orgName,
            repositories,
            errors,
            {
              search,
              pageNumber,
              pageSize,
            },
          );
        }
        orgFetched = true;
        this.logger.debug(
          `Got ${resp.totalCount} org repo(s) for ${ghConfig.host}`,
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

  /**
   * Returns GithubRepositoryResponse containing:
   *   - a list of unique repositories the github integrations have access to
   *   - a list of errors encountered by each app and/or token (if any exist)
   */
  async getRepositoriesFromIntegrations(
    search?: string,
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<GithubRepositoryResponse> {
    const ghConfigs = verifyAndGetIntegrations(
      {
        logger: this.logger,
      },
      this.integrations,
    );

    const credentialsByConfig = await getCredentialsFromIntegrations(
      this.githubCredentialsProvider,
      ghConfigs,
    );
    const repositories = new Map<string, GithubRepository>();
    const errors = new Map<number, GithubFetchError>();
    let totalCount = 0;
    for (const [ghConfig, credentials] of credentialsByConfig) {
      this.logger.debug(
        `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
      );
      for (const credential of credentials) {
        const octokit = buildOcto(
          {
            logger: this.logger,
            cache: this.cache,
          },
          { credential, errors },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        let resp: { totalCount?: number };
        if (isGithubAppCredential(credential)) {
          resp = await addGithubAppRepositories(
            {
              logger: this.logger,
              githubCredentialsProvider: this.githubCredentialsProvider,
            },
            octokit,
            credential,
            ghConfig,
            repositories,
            errors,
            {
              search,
              pageNumber,
              pageSize,
            },
          );
        } else {
          resp = await addGithubTokenRepositories(
            {
              logger: this.logger,
            },
            octokit,
            credential,
            repositories,
            errors,
            {
              search,
              pageNumber,
              pageSize,
            },
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

  async filterLocationsAccessibleFromIntegrations(
    locationUrls: string[],
  ): Promise<string[]> {
    const locationGitOwnerMap = new Map<string, string>();
    for (const locationUrl of locationUrls) {
      const split = locationUrl.split('/blob/');
      if (split.length < 2) {
        continue;
      }
      locationGitOwnerMap.set(locationUrl, gitUrlParse(split[0]).owner);
    }

    const ghConfigs = verifyAndGetIntegrations(
      {
        logger: this.logger,
      },
      this.integrations,
    );
    const credentialsByConfig = await getCredentialsFromIntegrations(
      this.githubCredentialsProvider,
      ghConfigs,
    );
    const allAccessibleAppOrgs = new Set<string>();
    const allAccessibleTokenOrgs = new Set<string>();
    const allAccessibleUsernames = new Set<string>();
    for (const [ghConfig, credentials] of credentialsByConfig) {
      for (const credential of credentials) {
        const octokit = buildOcto(
          {
            logger: this.logger,
            cache: this.cache,
          },
          { credential, errors: undefined },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        if (isGithubAppCredential(credential)) {
          const appOrgMap = await getAllAppOrgs(
            this.githubCredentialsProvider,
            ghConfig,
            credential.accountLogin,
          );
          for (const [_, ghOrg] of appOrgMap) {
            allAccessibleAppOrgs.add(ghOrg.name);
          }
        } else {
          // find authenticated GitHub owner...
          const username = (await octokit.rest.users.getAuthenticated())?.data
            ?.login;
          if (username) {
            allAccessibleUsernames.add(username);
          }
          // ... along with orgs accessible from the token auth
          (await octokit.paginate(octokit.rest.orgs.listForAuthenticatedUser))
            ?.map(org => org.login)
            ?.forEach(orgName => allAccessibleTokenOrgs.add(orgName));
        }
      }
    }

    return locationUrls.filter(loc => {
      if (!locationGitOwnerMap.has(loc)) {
        return false;
      }
      const owner = locationGitOwnerMap.get(loc)!;
      return (
        allAccessibleAppOrgs.has(owner) ||
        allAccessibleTokenOrgs.has(owner) ||
        allAccessibleUsernames.has(owner)
      );
    });
  }

  async findImportOpenPr(
    logger: LoggerService,
    input: {
      repoUrl: string;
      includeCatalogInfoContent?: boolean;
    },
  ): Promise<{
    prNum?: number;
    prUrl?: string;
    prTitle?: string;
    prBody?: string;
    prCatalogInfoContent?: string;
    lastUpdate?: string;
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

    const branchName = getBranchName(this.config);
    for (const credential of credentials) {
      const octo = buildOcto(
        {
          logger: this.logger,
          cache: this.cache,
        },
        { credential, owner },
        ghConfig.apiBaseUrl,
      );
      if (!octo) {
        continue;
      }
      try {
        return await findOpenPRForBranch(
          logger,
          this.config,
          octo,
          owner,
          repo,
          branchName,
          input.includeCatalogInfoContent,
        );
      } catch (error: any) {
        logErrorIfNeeded(this.logger, 'Error fetching pull requests', error);
      }
    }
    return {};
  }

  async submitPrToRepo(
    logger: LoggerService,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
      defaultBranch?: string;
      prTitle: string;
      prBody: string;
      catalogInfoContent: string;
    },
  ): Promise<{
    prUrl?: string;
    prNumber?: number;
    hasChanges?: boolean;
    lastUpdate?: string;
    errors?: string[];
  }> {
    const fileName = getCatalogFilename(this.config);
    const errors: any[] = [];

    const result = await executeFunctionOnFirstSuccessfulIntegration(
      {
        logger: this.logger,
        cache: this.cache,
        config: this.config,
        githubCredentialsProvider: this.githubCredentialsProvider,
      },
      this.integrations,
      {
        repoUrl: input.repoUrl,
        fn: async (
          validatedRepo: ValidatedRepo,
          octo: Octokit,
        ): Promise<{
          successful: boolean;
          result?: {
            prUrl?: string;
            prNumber?: number;
            hasChanges?: boolean;
            lastUpdate?: string;
          };
        }> => {
          const { owner, repo, branchName } = validatedRepo;
          try {
            // Check if there is already a catalogInfo in the default branch
            const catalogInfoFileExists = await fileExistsInDefaultBranch(
              logger,
              octo,
              owner,
              repo,
              fileName,
              input.defaultBranch,
            );
            if (catalogInfoFileExists) {
              // No need to create a PR => component will be imported as is
              return {
                successful: true,
                result: {
                  hasChanges: false,
                },
              };
            }

            const existingPrForBranch = await findOpenPRForBranch(
              logger,
              this.config,
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
              await createOrUpdateFileInBranch(
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
                successful: true,
                result: {
                  prNumber: existingPrForBranch.prNum,
                  prUrl: pullRequestResponse.data.html_url,
                  lastUpdate: pullRequestResponse.data.updated_at,
                },
              };
            }

            let branchExists = false;
            try {
              await octo.rest.git.getRef({
                owner,
                repo,
                ref: `heads/${branchName}`,
              });
              branchExists = true;
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

            if (branchExists) {
              // update it in case it is outdated compared to the base branch
              try {
                await octo.repos.merge({
                  owner: owner,
                  repo: repo,
                  base: branchName,
                  head: repoData.data.default_branch,
                });
              } catch (error: any) {
                logErrorIfNeeded(
                  this.logger,
                  `Could not merge default branch ${repoData.data.default_branch} into import branch ${branchName}`,
                  error,
                );
              }
            }

            await createOrUpdateFileInBranch(
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
            return {
              successful: true,
              result: {
                prNumber: pullRequestResponse.data.number,
                prUrl: pullRequestResponse.data.html_url,
                lastUpdate: pullRequestResponse.data.updated_at,
                hasChanges: true,
              },
            };
          } catch (e: any) {
            logErrorIfNeeded(
              this.logger,
              `Couldn't create PR in ${input.repoUrl}`,
              e,
            );
            errors.push(e.message);
            return { successful: false };
          }
        },
      },
    );

    if (result) {
      return result;
    }

    logger.warn(
      `Tried all possible GitHub credentials, but could not create PR in ${input.repoUrl}. Please try again later...`,
    );

    return {
      errors: errors,
    };
  }

  async hasFileInRepo(input: {
    repoUrl: string;
    defaultBranch?: string;
    fileName: string;
  }) {
    const fileExists = await executeFunctionOnFirstSuccessfulIntegration(
      {
        logger: this.logger,
        cache: this.cache,
        config: this.config,
        githubCredentialsProvider: this.githubCredentialsProvider,
      },
      this.integrations,
      {
        repoUrl: input.repoUrl,
        fn: async (validatedRepo: ValidatedRepo, octo: Octokit) => {
          const { owner, repo } = validatedRepo;
          const exists = await fileExistsInDefaultBranch(
            this.logger,
            octo,
            owner,
            repo,
            input.fileName,
            input.defaultBranch,
          );
          if (exists === undefined) {
            return { successful: false };
          }
          return { successful: true, result: exists };
        },
      },
    );

    if (fileExists === undefined) {
      throw new Error(
        `Could not determine if repo at ${input.repoUrl} already has a file named ${input.fileName} in its default branch (${input.defaultBranch})`,
      );
    }

    return fileExists;
  }

  async closeImportPR(
    logger: LoggerService,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
      comment: string;
    },
  ) {
    await executeFunctionOnFirstSuccessfulIntegration(
      {
        logger: this.logger,
        cache: this.cache,
        config: this.config,
        githubCredentialsProvider: this.githubCredentialsProvider,
      },
      this.integrations,
      {
        repoUrl: input.repoUrl,
        fn: async (validatedRepo: ValidatedRepo, octo: Octokit) => {
          const { owner, repo, branchName } = validatedRepo;
          try {
            const existingPrForBranch = await findOpenPRForBranch(
              logger,
              this.config,
              octo,
              owner,
              repo,
              branchName,
            );
            if (existingPrForBranch.prNum) {
              await closePRWithComment(
                octo,
                owner,
                repo,
                existingPrForBranch.prNum,
                input.comment,
              );
            }
            return { successful: true };
          } catch (e: any) {
            logErrorIfNeeded(
              this.logger,
              `Couldn't close PR in ${input.repoUrl}`,
              e,
            );
            return { successful: false };
          }
        },
      },
    );
  }

  async deleteImportBranch(input: {
    repoUrl: string;
    gitUrl: gitUrlParse.GitUrl;
  }) {
    await executeFunctionOnFirstSuccessfulIntegration(
      {
        logger: this.logger,
        cache: this.cache,
        config: this.config,
        githubCredentialsProvider: this.githubCredentialsProvider,
      },
      this.integrations,
      {
        repoUrl: input.repoUrl,
        fn: async (validatedRepo: ValidatedRepo, octo: Octokit) => {
          const { owner, repo, branchName } = validatedRepo;
          try {
            await octo.git.deleteRef({
              owner: owner,
              repo: repo,
              ref: `heads/${branchName}`,
            });
            return { successful: true };
          } catch (e: any) {
            logErrorIfNeeded(
              this.logger,
              `Couldn't close import PR and/or delete import branch in ${input.repoUrl}`,
              e,
            );
            return { successful: false };
          }
        },
      },
    );
  }

  async isRepoEmpty(input: { repoUrl: string }) {
    return await executeFunctionOnFirstSuccessfulIntegration(
      {
        logger: this.logger,
        cache: this.cache,
        config: this.config,
        githubCredentialsProvider: this.githubCredentialsProvider,
      },
      this.integrations,
      {
        repoUrl: input.repoUrl,
        fn: async (validatedRepo: ValidatedRepo, octo: Octokit) => {
          const { owner, repo } = validatedRepo;
          const resp = await octo.rest.repos.listContributors({
            owner: owner,
            repo: repo,
            page: 1,
            per_page: 1,
          });
          const status = resp.status as 200 | 204;
          return { successful: true, result: status === 204 };
        },
      },
    );
  }
}
