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
import type {
  GithubCredentials,
  GithubIntegrationConfig,
} from '@backstage/integration';

import { Octokit } from '@octokit/rest';

import { logErrorIfNeeded, paginateArray } from '../../helpers';
import {
  DefaultPageNumber,
  DefaultPageSize,
} from '../../service/handlers/handlers';
import type { CustomGithubCredentialsProvider } from '../GithubAppManager';
import type { GithubFetchError, GithubOrganization } from '../types';
import { computeTotalCountFromGitHubToken, handleError } from './utils';

export async function getAllAppOrgs(
  githubCredentialsProvider: CustomGithubCredentialsProvider,
  ghConfig: GithubIntegrationConfig,
  credentialAccountLogin?: string,
) {
  const result = new Map<string, GithubOrganization>();
  const resp = await githubCredentialsProvider.getAllAppInstallations(ghConfig);
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

export async function addGithubAppOrgs(
  deps: {
    logger: LoggerService;
    githubCredentialsProvider: CustomGithubCredentialsProvider;
  },
  octokit: Octokit,
  ghConfig: GithubIntegrationConfig,
  params: {
    credentialAccountLogin: string | undefined;
    search: string | undefined;
    orgs: Map<string, GithubOrganization>;
    errors: Map<number, GithubFetchError>;
  },
): Promise<{ totalCount?: number }> {
  const credentialAccountLogin = params.credentialAccountLogin;
  const search = params.search;
  const orgs = params.orgs;
  const errors = params.errors;
  let totalCount = 0;
  try {
    const resp = await getAllAppOrgs(
      deps.githubCredentialsProvider,
      ghConfig,
      credentialAccountLogin,
    );
    for (const [orgUrl, ghOrg] of resp) {
      if (search && !ghOrg.name.toLowerCase().includes(search.toLowerCase())) {
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
    logErrorIfNeeded(
      deps.logger,
      `Fetching organizations with access token for github app`,
      err,
    );
    errors.set(-1, err.message);
  }
  return { totalCount };
}

export async function addGithubTokenOrgs(
  deps: {
    logger: LoggerService;
  },
  octokit: Octokit,
  credential: GithubCredentials,
  params: {
    search: string | undefined;
    orgs: Map<string, GithubOrganization>;
    errors: Map<number, GithubFetchError>;
    pageNumber: number;
    pageSize: number;
  },
): Promise<{ totalCount?: number }> {
  const search = params.search;
  const orgs = params.orgs;
  const errors = params.errors;
  const pageNumber = params.pageNumber ?? DefaultPageNumber;
  const pageSize = params.pageSize ?? DefaultPageSize;

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

      totalCount = await computeTotalCountFromGitHubToken(
        deps,
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
    handleError(
      { logger: deps.logger },
      'Fetching orgs with token from token',
      credential,
      errors,
      err,
    );
  }
  return { totalCount };
}
