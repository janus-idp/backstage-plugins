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
import {
  ScmIntegrations,
  type GithubIntegrationConfig,
} from '@backstage/integration';

import { Octokit } from '@octokit/rest';
import gitUrlParse from 'git-url-parse';

import { logErrorIfNeeded } from '../../helpers';
import type { CustomGithubCredentialsProvider } from '../GithubAppManager';
import {
  isGithubAppCredential,
  type ExtendedGithubCredentials,
  type GithubFetchError,
} from '../types';
import { buildOcto } from './ghUtils';
import { validateAndBuildRepoData, ValidatedRepo } from './repoUtils';

/**
 * Creates the GithubFetchError to be stored in the returned errors array of the returned GithubRepositoryResponse object
 */
export function createCredentialError(
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

export function verifyAndGetIntegrations(
  deps: {
    logger: LoggerService;
  },

  integrations: ScmIntegrations,
) {
  const ghConfigs = integrations.github.list().map(ghInt => ghInt.config);
  if (ghConfigs.length === 0) {
    deps.logger.debug(
      'No GitHub Integration in config => returning an empty list of repositories.',
    );
    throw new Error(
      "Looks like there is no GitHub Integration in config. Please add a configuration entry under 'integrations.github",
    );
  }
  return ghConfigs;
}

export async function getCredentialsFromIntegrations(
  githubCredentialsProvider: CustomGithubCredentialsProvider,
  ghConfigs: GithubIntegrationConfig[],
) {
  const credentialsByConfig = new Map<
    GithubIntegrationConfig,
    ExtendedGithubCredentials[]
  >();
  for (const ghConfig of ghConfigs) {
    const creds = await getCredentialsForConfig(
      githubCredentialsProvider,
      ghConfig,
    );
    credentialsByConfig.set(ghConfig, creds);
  }
  return credentialsByConfig;
}

export async function getCredentialsForConfig(
  githubCredentialsProvider: CustomGithubCredentialsProvider,
  ghConfig: GithubIntegrationConfig,
) {
  return await githubCredentialsProvider.getAllCredentials({
    host: ghConfig.host,
  });
}

export async function extractConfigAndCreds(
  githubCredentialsProvider: CustomGithubCredentialsProvider,
  integrations: ScmIntegrations,
  input: {
    repoUrl: string;
    defaultBranch?: string;
  },
) {
  const ghConfig = integrations.github.byUrl(input.repoUrl)?.config;
  if (!ghConfig) {
    throw new Error(`Could not find GH integration from ${input.repoUrl}`);
  }

  const credentials = await githubCredentialsProvider.getAllCredentials({
    host: ghConfig.host,
  });
  if (credentials.length === 0) {
    throw new Error(`No credentials for GH integration`);
  }

  const gitUrl = gitUrlParse(input.repoUrl);
  return { ghConfig, credentials, gitUrl };
}

export function handleError(
  deps: {
    logger: LoggerService;
  },
  desc: string,
  credential: ExtendedGithubCredentials,
  errors: Map<number, GithubFetchError>,
  err: any,
) {
  logErrorIfNeeded(deps.logger, `${desc} failed`, err);
  const credentialError = createCredentialError(credential, err as Error);
  if (credentialError) {
    errors.set(-1, credentialError);
  }
}

export async function computeTotalCountFromGitHubToken(
  deps: {
    logger: LoggerService;
  },
  lastPageDataLengthProviderFn: (lastPageNumber: number) => Promise<number>,
  ghApiName: string,
  pageSize?: number,
  linkHeader?: string,
): Promise<number | undefined> {
  // There is no direct way to get the total count of repositories other than using octokit.paginate,
  // but will make us retrieve all pages, thus increasing our response time.
  // Workaround here is to analyze the headers, and get the link to the last page.
  if (!linkHeader) {
    deps.logger.debug(
      `No link header found in response from ${ghApiName} GH endpoint => returning current page size`,
    );
    return pageSize;
  }
  const lastPageLink = linkHeader
    .split(',')
    .find(s => s.includes('rel="last"'));
  if (!lastPageLink) {
    deps.logger.debug(
      `No rel='last' link found in response headers from ${ghApiName} GH endpoint => returning current page size`,
    );
    return pageSize;
  }
  const match = lastPageLink.match(/page=(\d+)/);
  if (!match || match.length < 2) {
    deps.logger.debug(
      `Unable to extract page number from rel='last' link found in response headers from ${ghApiName} GH endpoint => returning current page size`,
    );
    return pageSize;
  }

  const lastPageNumber = parseInt(match[1], 10);
  // Fetch the last page to count its items, as it might contain fewer than the requested size
  const lastPageDataLength = await lastPageDataLengthProviderFn(lastPageNumber);
  return pageSize
    ? (lastPageNumber - 1) * pageSize + lastPageDataLength
    : undefined;
}

export async function executeFunctionOnFirstSuccessfulIntegration<T>(
  deps: {
    logger: LoggerService;
    cache: CacheService;
    config: Config;
    githubCredentialsProvider: CustomGithubCredentialsProvider;
  },
  integrations: ScmIntegrations,
  params: {
    repoUrl: string;
    fn: (
      validatedRepo: ValidatedRepo,
      octo: Octokit,
    ) => Promise<{ successful: boolean; result?: T }>;
  },
) {
  const validatedRepo = await validateAndBuildRepoData(
    deps.githubCredentialsProvider,
    integrations,
    deps.config,
    params,
  );
  for (const credential of validatedRepo.credentials) {
    const octo = buildOcto(
      {
        logger: deps.logger,
        cache: deps.cache,
      },
      { credential, owner: validatedRepo.owner },
      validatedRepo.ghConfig.apiBaseUrl,
    );
    if (!octo) {
      continue;
    }
    const res = await params.fn(validatedRepo, octo);
    if (!res.successful) {
      continue;
    }
    return res.result;
  }
  return undefined;
}

export async function fetchFromAllIntegrations<T>(
  deps: {
    logger: LoggerService;
    cache: CacheService;
    githubCredentialsProvider: CustomGithubCredentialsProvider;
  },
  integrations: ScmIntegrations,
  params: {
    dataFetcher: (
      octo: Octokit,
      credential: ExtendedGithubCredentials,
      ghConfig: GithubIntegrationConfig,
    ) => Promise<{
      stopFetchingData?: boolean;
      result?: T;
      errors?: GithubFetchError[];
    }>;
  },
) {
  const ghConfigs = verifyAndGetIntegrations(deps, integrations);

  const credentialsByConfig = await getCredentialsFromIntegrations(
    deps.githubCredentialsProvider,
    ghConfigs,
  );
  const errors = new Map<number, GithubFetchError>();
  const data: T[] = [];
  const dataErrs: GithubFetchError[] = [];
  let stopFetchingData: boolean | undefined = false;
  for (const [ghConfig, credentials] of credentialsByConfig) {
    if (stopFetchingData) {
      break;
    }
    deps.logger.debug(
      `Got ${credentials.length} credential(s) for ${ghConfig.host}`,
    );
    for (const credential of credentials) {
      const octokit = buildOcto(
        deps,
        { credential, errors },
        ghConfig.apiBaseUrl,
      );
      if (!octokit) {
        continue;
      }
      const res = await params.dataFetcher(octokit, credential, ghConfig);
      res.errors?.forEach(err => dataErrs.push(err));

      if (res.result) {
        data.push(res.result);
      }

      stopFetchingData = res.stopFetchingData;
    }
  }

  const aggregatedErrors = new Map<number, GithubFetchError>();
  errors.forEach((err, num) => aggregatedErrors.set(num, err));
  dataErrs.forEach((err, idx) => aggregatedErrors.set(idx, err));

  return { data, errors: aggregatedErrors };
}

export function computeTotalCount<T>(
  data: T[],
  countList: number[],
  pageSize: number,
) {
  let totalCount = countList.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  if (totalCount < pageSize) {
    totalCount = data.length;
  }
  return totalCount;
}

export function extractLocationOwnerMap(locationUrls: string[]) {
  const locationGitOwnerMap = new Map<string, string>();
  for (const locationUrl of locationUrls) {
    const split = locationUrl.split('/blob/');
    if (split.length < 2) {
      continue;
    }
    locationGitOwnerMap.set(locationUrl, gitUrlParse(split[0]).owner);
  }
  return locationGitOwnerMap;
}
