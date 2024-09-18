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

import { CacheService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import {
  GithubCredentials,
  GithubIntegrationConfig,
  ScmIntegrations,
} from '@backstage/integration';

import { Octokit } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import {
  CustomGithubCredentialsProvider,
  getBranchName,
  getCatalogFilename,
  paginateArray,
} from '../helpers';
import {
  ExtendedGithubCredentials,
  GithubAppCredentials,
  GithubFetchError,
  GithubOrganization,
  GithubOrganizationResponse,
  GithubRepository,
  GithubRepositoryResponse,
  isGithubAppCredential,
} from '../types';
import { DefaultPageNumber, DefaultPageSize } from './handlers/handlers';

const GITHUB_DEFAULT_API_ENDPOINT = 'https://api.github.com';

// Cache TTL per entry added, based on the lower values of rate limits imposed by GH,
// i.e., 5K requests per hour for requests using a personal token.
// GitHub Apps owned by enterprises have a higher limit of 15K per hour.
// See https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28
const RESPONSE_CACHE_TTL_MILLIS = 60 * 60 * 1000;

export class GithubApiService {
  private readonly logger: Logger;
  private readonly integrations: ScmIntegrations;
  private readonly githubCredentialsProvider: CustomGithubCredentialsProvider;
  private readonly config: Config;
  // Cache for storing ETags (used for efficient caching of unchanged data returned by GitHub)
  private readonly cache: CacheService;

  constructor(logger: Logger, config: Config, cacheService: CacheService) {
    this.logger = logger;
    this.config = config;
    this.integrations = ScmIntegrations.fromConfig(config);
    this.githubCredentialsProvider =
      CustomGithubCredentialsProvider.fromIntegrations(this.integrations);
    this.cache = cacheService;
  }

  /**
   * Creates the GithubFetchError to be stored in the returned errors array of the returned GithubRepositoryResponse object
   */
  private createCredentialError(
    credential: ExtendedGithubCredentials,
    err?: Error,
  ): GithubFetchError | undefined {
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

  private registerHooks(octokit: Octokit) {
    const toFinalUrl = (options: any) => {
      // options.url might contain placeholders => need to replace them with their actual values to not get colliding keys
      return options.url.replace(/{([^}]+)}/g, (_: any, key: any) => {
        return options[key] ?? `{${key}}`; // Replace with actual value, or leave unchanged if not found
      });
    };

    const extractCacheKey = (options: any) =>
      `${options.method}--${toFinalUrl(options)}`;

    octokit.hook.before('request', async options => {
      if (!options.headers) {
        options.headers = {
          accept: 'application/json',
          'user-agent': 'rhdh/bulk-import',
        };
      }
      // Use ETag from in-memory cache if available
      const cacheKey = extractCacheKey(options);
      const existingEtag = await this.cache
        .get(cacheKey)
        ?.then(val => (val as any)?.etag);
      if (existingEtag) {
        options.headers['If-None-Match'] = existingEtag;
      } else {
        this.logger.debug(`cache miss for key "${cacheKey}"`);
      }
    });

    octokit.hook.after('request', async (response, options) => {
      this.logger.debug(
        `[GH API] ${options.method} ${toFinalUrl(options)}: ${response.status}`,
      );
      // If we get a successful response, the resource has changed, so update the in-memory cache
      const cacheKey = extractCacheKey(options);
      await this.cache.set(
        cacheKey,
        {
          etag: response.headers.etag,
          ...response,
        },
        { ttl: RESPONSE_CACHE_TTL_MILLIS },
      );
    });

    octokit.hook.error('request', async (error: any, options) => {
      this.logger.debug(
        `[GH API] ${options.method} ${toFinalUrl(options)}: ${error.status}`,
      );
      if (error.status !== 304) {
        throw error;
      }
      // "304 Not Modified" means that the resource hasn't changed
      // and we should have a version of it in the cache
      return await this.cache.get(extractCacheKey(options));
    });
  }

  private async getAllAppOrgs(
    ghConfig: GithubIntegrationConfig,
    credentialAccountLogin?: string,
  ) {
    const result = new Map<string, GithubOrganization>();
    const resp =
      await this.githubCredentialsProvider.getAllAppInstallations(ghConfig);
    for (const installation of resp ?? []) {
      if (
        !(
          installation.account &&
          installation.target_type?.toLowerCase() === 'organization'
        )
      ) {
        continue;
      }
      const acc = installation.account!;
      if (credentialAccountLogin !== acc.login) {
        continue;
      }
      result.set(acc.url, {
        id: acc.id,
        description: acc.description ?? undefined,
        name: acc.login,
        url: acc.html_url,
        html_url: acc.html_url,
        repos_url: acc.repos_url,
        events_url: acc.events_url,
      });
    }
    return result;
  }

  private async addGithubAppOrgs(
    octokit: Octokit,
    credentialAccountLogin: string | undefined,
    ghConfig: GithubIntegrationConfig,
    search: string | undefined,
    orgs: Map<string, GithubOrganization>,
    errors: Map<number, GithubFetchError>,
  ): Promise<{ totalCount?: number }> {
    let totalCount = 0;
    try {
      const resp = await this.getAllAppOrgs(ghConfig, credentialAccountLogin);
      for (const [orgUrl, ghOrg] of resp) {
        if (
          search &&
          !ghOrg.name.toLowerCase().includes(search.toLowerCase())
        ) {
          continue;
        }
        const orgData = await octokit.request(
          orgUrl.replace('/users/', '/orgs/'),
        );
        orgs.set(ghOrg.name, {
          ...ghOrg,
          public_repos: orgData?.data?.public_repos,
          total_private_repos: orgData?.data?.total_private_repos,
          owned_private_repos: orgData?.data?.owned_private_repos,
        });
        totalCount++;
      }
    } catch (err: any) {
      this.logger.error(
        `Fetching organizations with access token for github app, failed with ${err}`,
      );
      errors.set(-1, err.message);
    }
    return { totalCount };
  }

  private async addGithubTokenOrgs(
    octokit: Octokit,
    credential: GithubCredentials,
    search: string | undefined,
    orgs: Map<string, GithubOrganization>,
    errors: Map<number, GithubFetchError>,
    pageNumber: number = DefaultPageNumber,
    pageSize: number = DefaultPageSize,
  ): Promise<{ totalCount?: number }> {
    let totalCount: number | undefined;

    try {
      let matchingOrgs;
      if (search) {
        // Initial idea was to leverage octokit.rest.search.users({q: `${search} type:org`}),
        // but this searches across all of GitHub, not only the orgs accessible by the current creds.
        // That's why we are searching in everything, hoping the list of organizations to not be that big in size
        const resp = await octokit.paginate(
          octokit.rest.orgs.listForAuthenticatedUser,
          {
            sort: 'full_name',
            direction: 'asc',
          },
        );
        const allMatchingOrgs =
          resp?.filter(org =>
            org.login.toLowerCase().includes(search.toLowerCase()),
          ) ?? [];
        const matchingOrgsPage = paginateArray(
          allMatchingOrgs,
          pageNumber,
          pageSize,
        );
        matchingOrgs = matchingOrgsPage.result;
        totalCount = matchingOrgsPage.totalCount;
      } else {
        /**
         * The listForAuthenticatedUser endpoint will grab all the repositories the github token has explicit access to.
         * These would include repositories they own, repositories where they are a collaborator,
         * and repositories that they can access through an organization membership.
         */
        const resp = await octokit.rest.orgs.listForAuthenticatedUser({
          page: pageNumber,
          per_page: pageSize,
          sort: 'full_name',
          direction: 'asc',
        });
        matchingOrgs = resp?.data ?? [];

        totalCount = await this.computeTotalCountFromGitHubToken(
          async (lastPageNumber: number) =>
            octokit.orgs
              .listForAuthenticatedUser({
                page: lastPageNumber,
                per_page: 100,
              })
              .then(lastPageResp => lastPageResp.data.length),
          'orgs.listForAuthenticatedUser',
          resp?.data?.length,
          resp?.headers?.link,
        );
      }

      for (const org of matchingOrgs) {
        const orgData = await octokit.request(org.url);
        const ghOrg: GithubOrganization = {
          id: org.id,
          name: org.login,
          description: org.description ?? undefined,
          url: orgData?.data?.html_url ?? org.url,
          repos_url: org.repos_url,
          hooks_url: org.hooks_url,
          issues_url: org.issues_url,
          members_url: org.members_url,
          public_members_url: org.public_members_url,
          avatar_url: org.avatar_url,
          public_repos: orgData?.data?.public_repos,
          total_private_repos: orgData?.data?.total_private_repos,
          owned_private_repos: orgData?.data?.owned_private_repos,
        };
        orgs.set(org.login, ghOrg);
      }
    } catch (err) {
      this.handleError(
        'Fetching orgs with token from token',
        credential,
        errors,
        err,
      );
    }
    return { totalCount };
  }

  private async searchRepos(
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

    const ghConfigs = this.verifyAndGetIntegrations();
    const credentialsByConfig =
      await this.getCredentialsFromIntegrations(ghConfigs);
    const allAccessibleAppOrgs = new Set<string>();
    const allAccessibleTokenOrgs = new Set<string>();
    const allAccessibleUsernames = new Set<string>();
    for (const [ghConfig, credentials] of credentialsByConfig) {
      for (const credential of credentials) {
        const octokit = this.buildOcto(
          { credential, errors: undefined },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        if (isGithubAppCredential(credential)) {
          const appOrgMap = await this.getAllAppOrgs(
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

  /**
   * Adds the repositories accessible by the provided github app to the provided repositories Map<string, GithubRepository>
   * If any errors occurs, adds them to the provided errors Map<number, GithubFetchError>
   */
  private async addGithubAppRepositories(
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
        const allOrgsMap = await this.getAllAppOrgs(
          ghConfig,
          credential.accountLogin,
        );
        const orgSearch: string[] = [];
        for (const [_orgUrl, ghOrg] of allOrgsMap) {
          orgSearch.push(`org:${ghOrg.name}`);
        }
        const query = `${search} in:name ${orgSearch.join(' ')}`;
        const searchResp = await this.searchRepos(
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
   * If any errors occurs, adds them to the provided errors Map<number, GithubFetchError>
   */
  private async addGithubTokenRepositories(
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

        const searchResp = await this.searchRepos(
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

        totalCount = await this.computeTotalCountFromGitHubToken(
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
      this.handleError(
        'Fetching repositories with token from token',
        credential,
        errors,
        err,
      );
    }
    return { totalCount };
  }

  private handleError(
    desc: string,
    credential: ExtendedGithubCredentials,
    errors: Map<number, GithubFetchError>,
    err: any,
  ) {
    this.logger.error(`${desc} failed with ${err}`);
    const credentialError = this.createCredentialError(
      credential,
      err as Error,
    );
    if (credentialError) {
      errors.set(-1, credentialError);
    }
  }

  private async addGithubTokenOrgRepositories(
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
        const searchResp = await this.searchRepos(
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

        totalCount = await this.computeTotalCountFromGitHubToken(
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
      this.handleError(
        'Fetching org repositories with token from token',
        credential,
        errors,
        err,
      );
    }
    return { totalCount };
  }

  private async computeTotalCountFromGitHubToken(
    lastPageDataLengthProviderFn: (lastPageNumber: number) => Promise<number>,
    ghApiName: string,
    pageSize?: number,
    linkHeader?: string,
  ): Promise<number | undefined> {
    // There is no direct way to get the total count of repositories other than using octokit.paginate,
    // but will make us retrieve all pages, thus increasing our response time.
    // Workaround here is to analyze the headers, and get the link to the last page.
    if (!linkHeader) {
      this.logger.debug(
        `No link header found in response from ${ghApiName} GH endpoint => returning current page size`,
      );
      return pageSize;
    }
    const lastPageLink = linkHeader
      .split(',')
      .find(s => s.includes('rel="last"'));
    if (!lastPageLink) {
      this.logger.debug(
        `No rel='last' link found in response headers from ${ghApiName} GH endpoint => returning current page size`,
      );
      return pageSize;
    }
    const match = lastPageLink.match(/page=(\d+)/);
    if (!match || match.length < 2) {
      this.logger.debug(
        `Unable to extract page number from rel='last' link found in response headers from ${ghApiName} GH endpoint => returning current page size`,
      );
      return pageSize;
    }

    const lastPageNumber = parseInt(match[1], 10);
    // Fetch the last page to count its items, as it might contain fewer than the requested size
    const lastPageDataLength =
      await lastPageDataLengthProviderFn(lastPageNumber);
    return pageSize
      ? (lastPageNumber - 1) * pageSize + lastPageDataLength
      : undefined;
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

    const credentials = await this.getCredentialsForConfig(ghConfig);
    const errors = new Map<number, GithubFetchError>();
    let repository: GithubRepository | undefined = undefined;
    for (const credential of credentials) {
      const octokit = this.buildOcto(
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
    const ghConfigs = this.verifyAndGetIntegrations();

    const credentialsByConfig =
      await this.getCredentialsFromIntegrations(ghConfigs);
    const orgs = new Map<string, GithubOrganization>();
    const errors = new Map<number, GithubFetchError>();
    let totalCount = 0;
    for (const [ghConfig, credentials] of credentialsByConfig) {
      this.logger.debug(
        `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
      );
      for (const credential of credentials) {
        const octokit = this.buildOcto(
          { credential, errors },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        let resp: { totalCount?: number } = {};
        if (isGithubAppCredential(credential)) {
          resp = await this.addGithubAppOrgs(
            octokit,
            credential.accountLogin,
            ghConfig,
            search,
            orgs,
            errors,
          );
        } else {
          resp = await this.addGithubTokenOrgs(
            octokit,
            credential,
            search,
            orgs,
            errors,
            pageNumber,
            pageSize,
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
    const ghConfigs = this.verifyAndGetIntegrations();
    const credentialsByConfig =
      await this.getCredentialsFromIntegrations(ghConfigs);
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
        const octokit = this.buildOcto(
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
          resp = await this.addGithubAppRepositories(
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
          resp = await this.addGithubTokenOrgRepositories(
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
    const ghConfigs = this.verifyAndGetIntegrations();

    const credentialsByConfig =
      await this.getCredentialsFromIntegrations(ghConfigs);
    const repositories = new Map<string, GithubRepository>();
    const errors = new Map<number, GithubFetchError>();
    let totalCount = 0;
    for (const [ghConfig, credentials] of credentialsByConfig) {
      this.logger.debug(
        `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
      );
      for (const credential of credentials) {
        const octokit = this.buildOcto(
          { credential, errors },
          ghConfig.apiBaseUrl,
        );
        if (!octokit) {
          continue;
        }
        let resp: { totalCount?: number };
        if (isGithubAppCredential(credential)) {
          resp = await this.addGithubAppRepositories(
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
          resp = await this.addGithubTokenRepositories(
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

  private async getCredentialsFromIntegrations(
    ghConfigs: GithubIntegrationConfig[],
  ) {
    const credentialsByConfig = new Map<
      GithubIntegrationConfig,
      ExtendedGithubCredentials[]
    >();
    for (const ghConfig of ghConfigs) {
      const creds = await this.getCredentialsForConfig(ghConfig);
      credentialsByConfig.set(ghConfig, creds);
    }
    return credentialsByConfig;
  }

  private async getCredentialsForConfig(ghConfig: GithubIntegrationConfig) {
    return await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
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
      const octo = this.buildOcto({ credential, owner }, ghConfig.apiBaseUrl);
      if (!octo) {
        continue;
      }
      try {
        return await this.findOpenPRForBranch(
          logger,
          octo,
          owner,
          repo,
          branchName,
          input.includeCatalogInfoContent,
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
    withCatalogInfoContent: boolean = false,
  ): Promise<{
    prNum?: number;
    prUrl?: string;
    prTitle?: string;
    prBody?: string;
    prCatalogInfoContent?: string;
    lastUpdate?: string;
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
            prTitle: pull.title,
            prBody: pull.body ?? undefined,
            prCatalogInfoContent: withCatalogInfoContent
              ? await this.getCatalogInfoContentFromPR(
                  logger,
                  octo,
                  owner,
                  repo,
                  pull.number,
                  pull.head.sha,
                )
              : undefined,
            lastUpdate: pull.updated_at,
          };
        }
      }
    } catch (error) {
      logger.warn(`Error fetching pull requests: ${error}`);
    }
    return {};
  }

  private async getCatalogInfoContentFromPR(
    logger: Logger,
    octo: Octokit,
    owner: string,
    repo: string,
    prNumber: number,
    prHeadSha: string,
  ): Promise<string | undefined> {
    try {
      const filePath = getCatalogFilename(this.config);
      const fileContentResponse = await octo.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: prHeadSha,
      });
      if (!fileContentResponse.data) {
        return undefined;
      }
      if (!('content' in fileContentResponse.data)) {
        return undefined;
      }
      return Buffer.from(fileContentResponse.data.content, 'base64').toString(
        'utf-8',
      );
    } catch (error: any) {
      logger.warn(
        `Error fetching catalog-info content from PR ${prNumber}: ${error}`,
      );
      return undefined;
    }
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
    const { ghConfig, owner, repo, credentials, branchName } =
      await this.validateAndBuildRepoData(input);
    const fileName = getCatalogFilename(this.config);
    const errors: any[] = [];
    for (const credential of credentials) {
      const octo = this.buildOcto({ credential, owner }, ghConfig.apiBaseUrl);
      if (!octo) {
        continue;
      }
      try {
        // Check if there is already a catalogInfo in the default branch
        const catalogInfoFileExists = await this.fileExistsInDefaultBranch(
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
            hasChanges: false,
          };
        }

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
            lastUpdate: pullRequestResponse.data.updated_at,
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
            logger.debug(
              `could not merge default branch ${repoData.data.default_branch} into import branch ${branchName}: ${error}`,
            );
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
        return {
          prNumber: pullRequestResponse.data.number,
          prUrl: pullRequestResponse.data.html_url,
          lastUpdate: pullRequestResponse.data.updated_at,
          hasChanges: true,
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

  private async validateAndBuildRepoData(input: {
    repoUrl: string;
    gitUrl: gitUrlParse.GitUrl;
  }) {
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

    const branchName = getBranchName(this.config);
    return { ghConfig, owner, repo, credentials, branchName };
  }

  private async fileExistsInDefaultBranch(
    logger: Logger,
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

  async doesCatalogInfoAlreadyExistInRepo(
    logger: Logger,
    input: {
      repoUrl: string;
      defaultBranch?: string;
    },
  ) {
    return this.hasFileInRepo(logger, {
      ...input,
      fileName: getCatalogFilename(this.config),
    });
  }

  async doesCodeOwnersAlreadyExistInRepo(
    logger: Logger,
    input: {
      repoUrl: string;
      defaultBranch?: string;
    },
  ) {
    return this.hasFileInRepo(logger, {
      ...input,
      fileName: '.github/CODEOWNERS',
    });
  }

  async hasFileInRepo(
    logger: Logger,
    input: {
      repoUrl: string;
      defaultBranch?: string;
      fileName: string;
    },
  ) {
    const { ghConfig, credentials, gitUrl } =
      await this.extractConfigAndCreds(input);

    for (const credential of credentials) {
      const octo = this.buildOcto(
        { credential, owner: gitUrl.owner },
        ghConfig.apiBaseUrl,
      );
      if (!octo) {
        continue;
      }
      const exists = await this.fileExistsInDefaultBranch(
        logger,
        octo,
        gitUrl.owner,
        gitUrl.name,
        input.fileName,
        input.defaultBranch,
      );
      if (exists === undefined) {
        continue;
      }
      return exists;
    }
    throw new Error(
      `Could not determine if repo at ${input.repoUrl} already has a file named ${input.fileName} in its default branch (${input.defaultBranch})`,
    );
  }

  private async extractConfigAndCreds(input: {
    repoUrl: string;
    defaultBranch?: string;
  }) {
    const ghConfig = this.integrations.github.byUrl(input.repoUrl)?.config;
    if (!ghConfig) {
      throw new Error(`Could not find GH integration from ${input.repoUrl}`);
    }

    const credentials = await this.githubCredentialsProvider.getAllCredentials({
      host: ghConfig.host,
    });
    if (credentials.length === 0) {
      throw new Error(`No credentials for GH integration`);
    }

    const gitUrl = gitUrlParse(input.repoUrl);
    return { ghConfig, credentials, gitUrl };
  }

  async closePR(
    logger: Logger,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
      comment: string;
    },
  ) {
    const { ghConfig, owner, repo, credentials, branchName } =
      await this.validateAndBuildRepoData(input);
    for (const credential of credentials) {
      const octo = this.buildOcto({ credential, owner }, ghConfig.apiBaseUrl);
      if (!octo) {
        continue;
      }
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
      }
    }
  }

  private buildOcto(
    input: {
      credential: ExtendedGithubCredentials;
      owner?: string;
      errors?: Map<number, GithubFetchError>;
    },
    apiBaseUrl: string = GITHUB_DEFAULT_API_ENDPOINT,
  ): Octokit | undefined {
    if ('error' in input.credential) {
      if (input.credential.error?.name !== 'NotFoundError') {
        this.logger.error(
          `Obtaining the Access Token Github App with appId: ${input.credential.appId} failed with ${input.credential.error}`,
        );
        const credentialError = this.createCredentialError(input.credential);
        if (credentialError) {
          this.logger.debug(`${input.credential.appId}: ${credentialError}`);
          if (input.errors) {
            input.errors.set(input.credential.appId, credentialError);
          }
        }
      }
      return undefined;
    }
    if (
      isGithubAppCredential(input.credential) &&
      input.owner &&
      input.credential.accountLogin !== input.owner
    ) {
      return undefined;
    }
    const octokit = new Octokit({
      baseUrl: apiBaseUrl,
      auth: input.credential.token,
    });
    this.registerHooks(octokit);
    return octokit;
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

  async deleteImportBranch(
    logger: Logger,
    input: {
      repoUrl: string;
      gitUrl: gitUrlParse.GitUrl;
    },
  ) {
    const { ghConfig, owner, repo, credentials, branchName } =
      await this.validateAndBuildRepoData(input);
    for (const credential of credentials) {
      const octo = this.buildOcto({ credential, owner }, ghConfig.apiBaseUrl);
      if (!octo) {
        continue;
      }
      try {
        await octo.git.deleteRef({
          owner: owner,
          repo: repo,
          ref: `heads/${branchName}`,
        });
        return;
      } catch (e: any) {
        logger.warn(
          `Couldn't close import PR and/or delete import branch in ${input.repoUrl}: ${e}`,
        );
      }
    }
  }

  async isRepoEmpty(input: { repoUrl: string }) {
    const { ghConfig, credentials, gitUrl } =
      await this.extractConfigAndCreds(input);
    const owner = gitUrl.organization;
    const repo = gitUrl.name;

    for (const credential of credentials) {
      const octo = this.buildOcto({ credential, owner }, ghConfig.apiBaseUrl);
      if (!octo) {
        continue;
      }
      const resp = await octo.rest.repos.listContributors({
        owner,
        repo,
        page: 1,
        per_page: 1,
      });
      const status = resp.status as 200 | 204;
      if (status === 204) {
        return true;
      }
    }
    return false;
  }
}
