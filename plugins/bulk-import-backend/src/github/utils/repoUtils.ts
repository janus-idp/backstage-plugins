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
import type { Config } from '@backstage/config';
import type {
  GithubCredentials,
  GithubIntegrationConfig,
  ScmIntegrations,
} from '@backstage/integration';

import { Octokit } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';

import { getBranchName } from '../../catalog/catalogUtils';
import { logErrorIfNeeded } from '../../helpers';
import {
  DefaultPageNumber,
  DefaultPageSize,
} from '../../service/handlers/handlers';
import type { CustomGithubCredentialsProvider } from '../GithubAppManager';
import type {
  ExtendedGithubCredentials,
  GithubAppCredentials,
  GithubFetchError,
  GithubRepository,
} from '../types';
import { getAllAppOrgs } from './orgUtils';
import {
  computeTotalCountFromGitHubToken,
  createCredentialError,
  handleError,
} from './utils';

export type ValidatedRepo = {
  ghConfig: GithubIntegrationConfig;
  credentials: ExtendedGithubCredentials[];
  owner: string;
  repo: string;
  branchName: string;
};

export async function validateAndBuildRepoData(
  githubCredentialsProvider: CustomGithubCredentialsProvider,
  integrations: ScmIntegrations,
  config: Config,
  input: {
    repoUrl: string;
  },
): Promise<ValidatedRepo> {
  const ghConfig = integrations.github.byUrl(input.repoUrl)?.config;
  if (!ghConfig) {
    throw new Error(`Could not find GH integration from ${input.repoUrl}`);
  }

  const gitUrl = gitUrlParse(input.repoUrl);
  const owner = gitUrl.organization;
  const repo = gitUrl.name;

  const credentials = await githubCredentialsProvider.getAllCredentials({
    host: ghConfig.host,
  });
  if (credentials.length === 0) {
    throw new Error(`No credentials for GH integration`);
  }

  const branchName = getBranchName(config);
  return { ghConfig, owner, repo, credentials, branchName };
}

export async function searchRepos(
  octokit: Octokit,
  ghSearchQuery: string,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<{ totalCount?: number; repositories: GithubRepository[] }> {
  const repoSearchResp = await octokit.rest.search.repos({
    q: ghSearchQuery,
    order: 'asc',
    page: pageNumber,
    per_page: pageSize,
  });
  return {
    totalCount: repoSearchResp?.data?.total_count,
    repositories:
      repoSearchResp?.data?.items?.map(repo => {
        return {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          updated_at: repo.updated_at,
        };
      }) ?? [],
  };
}

/**
 * Adds the repositories accessible by the provided github app to the provided repositories Map<string, GithubRepository>
 * If any errors occurs, adds them to the provided errors Map<number, GithubFetchError>
 */
export async function addGithubAppRepositories(
  deps: {
    logger: LoggerService;
    githubCredentialsProvider: CustomGithubCredentialsProvider;
  },
  octokit: Octokit,
  credential: GithubAppCredentials,
  ghConfig: GithubIntegrationConfig,
  repositories: Map<string, GithubRepository>,
  errors: Map<number, GithubFetchError>,
  reqParams?: {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  },
): Promise<{ totalCount?: number }> {
  const search = reqParams?.search;
  const pageNumber = reqParams?.pageNumber ?? DefaultPageNumber;
  const pageSize = reqParams?.pageSize ?? DefaultPageSize;
  let totalCount: number | undefined;
  try {
    if (search) {
      const allOrgsMap = await getAllAppOrgs(
        deps.githubCredentialsProvider,
        ghConfig,
        credential.accountLogin,
      );
      const orgSearch: string[] = [];
      for (const [_orgUrl, ghOrg] of allOrgsMap) {
        orgSearch.push(`org:${ghOrg.name}`);
      }
      const query = `${search} in:name ${orgSearch.join(' ')}`;
      const searchResp = await searchRepos(
        octokit,
        query,
        pageNumber,
        pageSize,
      );
      totalCount = searchResp.totalCount;
      searchResp.repositories.forEach(repo =>
        repositories.set(repo.full_name, repo),
      );
    } else {
      const resp = await octokit.apps.listReposAccessibleToInstallation({
        page: pageNumber,
        per_page: pageSize,
      });
      const repos = resp?.data?.repositories ?? resp?.data;
      repos?.forEach(repo => {
        repositories.set(repo.full_name, {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          updated_at: repo.updated_at,
        });
      });
      totalCount = resp?.data?.total_count;
    }
  } catch (err: any) {
    logErrorIfNeeded(
      deps.logger,
      `Fetching repositories with access token for github app ${credential.appId}`,
      err,
    );
    const credentialError = createCredentialError(credential, err as Error);
    if (credentialError) {
      errors.set(credential.appId, credentialError);
    }
  }
  return { totalCount };
}

/**
 * Adds the user or organization repositories accessible by the github token to the provided repositories Map<string, GithubRepository> if they're owned by the specified owner
 * If any errors occurs, adds them to the provided errors Map<number, GithubFetchError>
 */
export async function addGithubTokenRepositories(
  deps: {
    logger: LoggerService;
  },
  octokit: Octokit,
  credential: GithubCredentials,
  repositories: Map<string, GithubRepository>,
  errors: Map<number, GithubFetchError>,
  reqParams?: {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  },
): Promise<{ totalCount?: number }> {
  const search = reqParams?.search;
  const pageNumber = reqParams?.pageNumber ?? DefaultPageNumber;
  const pageSize = reqParams?.pageSize ?? DefaultPageSize;
  let totalCount: number | undefined;
  try {
    if (search) {
      // Get currently authenticated user
      const username = (await octokit.rest.users.getAuthenticated())?.data
        ?.login;
      let query = `${search} in:name user:${username}`;

      const allOrgsResp = await octokit.paginate(
        octokit.rest.orgs.listForAuthenticatedUser,
        {
          sort: 'full_name',
          direction: 'asc',
        },
      );
      const orgSearch: string[] = [];
      allOrgsResp?.forEach(org => orgSearch.push(`org:${org.login}`));
      if (orgSearch.length > 0) {
        query += ` ${orgSearch.join(' ')}`;
      }

      const searchResp = await searchRepos(
        octokit,
        query,
        pageNumber,
        pageSize,
      );
      totalCount = searchResp.totalCount;
      searchResp.repositories.forEach(repo =>
        repositories.set(repo.full_name, repo),
      );
    } else {
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
        repositories.set(repo.full_name, {
          name: repo.name,
          full_name: repo.full_name,
          url: repo.url,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
          updated_at: repo.updated_at,
        });
      });

      totalCount = await computeTotalCountFromGitHubToken(
        deps,
        async (lastPageNumber: number) =>
          octokit.repos
            .listForAuthenticatedUser({
              page: lastPageNumber,
              per_page: 100,
            })
            .then(lastPageResp => lastPageResp.data.length),
        'repos.listForAuthenticatedUser',
        resp?.data?.length,
        resp?.headers?.link,
      );
    }
  } catch (err) {
    handleError(
      deps,
      'Fetching repositories with token from token',
      credential,
      errors,
      err,
    );
  }
  return { totalCount };
}

export async function addGithubTokenOrgRepositories(
  deps: {
    logger: LoggerService;
  },
  octokit: Octokit,
  credential: GithubCredentials,
  org: string,
  repositories: Map<string, GithubRepository>,
  errors: Map<number, GithubFetchError>,
  reqParams?: {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  },
): Promise<{ totalCount?: number }> {
  const search = reqParams?.search;
  const pageNumber = reqParams?.pageNumber ?? DefaultPageNumber;
  const pageSize = reqParams?.pageSize ?? DefaultPageSize;
  let totalCount: number | undefined;
  try {
    if (search) {
      const query = `${search} in:name org:${org}`;
      const searchResp = await searchRepos(
        octokit,
        query,
        pageNumber,
        pageSize,
      );
      totalCount = searchResp.totalCount;
      searchResp.repositories.forEach(repo =>
        repositories.set(repo.full_name, repo),
      );
    } else {
      /**
       * The listForAuthenticatedUser endpoint will grab all the repositories the github token has explicit access to.
       * These would include repositories they own, repositories where they are a collaborator,
       * and repositories that they can access through an organization membership.
       */
      const resp = await octokit.rest.repos.listForOrg({
        org,
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
          default_branch: repo.default_branch ?? 'main',
          updated_at: repo.updated_at,
        };
        repositories.set(githubRepo.full_name, githubRepo);
      });

      totalCount = await computeTotalCountFromGitHubToken(
        deps,
        async (lastPageNumber: number) =>
          octokit.repos
            .listForOrg({
              org,
              page: lastPageNumber,
              per_page: 100,
            })
            .then(lastPageResp => lastPageResp.data.length),
        'repos.listForOrg',
        resp?.data?.length,
        resp?.headers?.link,
      );
    }
  } catch (err) {
    handleError(
      deps,
      'Fetching org repositories with token from token',
      credential,
      errors,
      err,
    );
  }
  return { totalCount };
}

export async function fileExistsInDefaultBranch(
  logger: LoggerService,
  octo: Octokit,
  owner: string,
  repo: string,
  fileName: string,
  defaultBranch: string = 'main',
) {
  try {
    await octo.rest.repos.getContent({
      owner,
      repo,
      path: fileName,
      ref: defaultBranch,
    });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    logger.debug(
      `Unable to determine if a file named ${fileName} already exists in repo ${repo}: ${error}`,
    );
    return undefined;
  }
}

export async function createOrUpdateFileInBranch(
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
