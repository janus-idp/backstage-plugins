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

import gitUrlParse from 'git-url-parse';

import type { Components } from '../../generated/openapi.d';
import type { GithubRepositoryResponse } from '../../types';
import type { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  type HandlerResponse,
} from './handlers';
import { getImportStatusFromLocations } from './importStatus';
import {CatalogHttpClient} from "../../catalog/catalogHttpClient";

export async function findAllRepositories(
    deps: {
      logger: LoggerService,
      config: Config,
      githubApiService: GithubApiService,
      catalogHttpClient: CatalogHttpClient,
    },
  reqParams?: {
    search?: string;
    checkStatus?: boolean;
    pageNumber?: number;
    pageSize?: number;
  },
): Promise<HandlerResponse<Components.Schemas.RepositoryList>> {
  const search = reqParams?.search;
  const checkStatus = reqParams?.checkStatus ?? false;
  const pageNumber = reqParams?.pageNumber ?? DefaultPageNumber;
  const pageSize = reqParams?.pageSize ?? DefaultPageSize;
  deps.logger.debug(
    `Getting all repositories - (search,page,size)=('${search ?? ''}',${pageNumber},${pageSize})..`,
  );
  return deps.githubApiService
    .getRepositoriesFromIntegrations(search, pageNumber, pageSize)
    .then(response =>
      formatResponse(
          deps,
        response,
        checkStatus,
        ),
    );
}

export async function findRepositoriesByOrganization(
  deps: {
    logger: LoggerService;
    config: Config;
    githubApiService: GithubApiService;
    catalogHttpClient: CatalogHttpClient;
  },
  orgName: string,
  search?: string,
  checkStatus: boolean = false,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.RepositoryList>> {
  deps.logger.debug(
    `Getting all repositories for org "${orgName}" - (search,page,size)=(${search},${pageNumber},${pageSize})..`,
  );
  return deps.githubApiService
    .getOrgRepositoriesFromIntegrations(orgName, search, pageNumber, pageSize)
    .then(response =>
      formatResponse(
          deps,
        response,
        checkStatus,
        ),
    );
}

async function formatResponse(
    deps: {
      logger: LoggerService;
      config: Config;
      githubApiService: GithubApiService;
      catalogHttpClient: CatalogHttpClient;
    },
  allReposAccessible: GithubRepositoryResponse,
  checkStatus: boolean,
) {
  const errorList: string[] = [];
  if (allReposAccessible.errors) {
    for (const err of allReposAccessible.errors) {
      if (err.error?.message) {
        errorList.push(err.error.message);
      }
    }
  }
  if (allReposAccessible.repositories?.length === 0 && errorList.length > 0) {
    return {
      statusCode: 500,
      responseBody: {
        errors: errorList,
      },
    };
  }

  const catalogLocations = checkStatus
    ? (await deps.catalogHttpClient.listCatalogUrlLocations()).targetUrls
    : [];
  const repoList: Components.Schemas.Repository[] = [];
  if (allReposAccessible.repositories) {
    for (const repo of allReposAccessible.repositories) {
      const gitUrl = gitUrlParse(repo.html_url);
      let importStatus:
        | { status: Components.Schemas.ImportStatus; lastUpdate?: string }
        | null
        | undefined;
      const errors: string[] = [];
      try {
        importStatus = checkStatus
          ? await getImportStatusFromLocations(
              deps,
              repo.html_url,
              catalogLocations,
              repo.default_branch,
            )
          : undefined;
      } catch (error: any) {
        errors.push(error.message);
      }
      const repoUpdatedAt = repo.updated_at ? repo.updated_at : undefined;
      repoList.push({
        id: `${gitUrl.organization}/${repo.name}`,
        name: repo.name,
        organization: gitUrl.organization,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
        importStatus: importStatus?.status,
        lastUpdate: importStatus ? importStatus.lastUpdate : repoUpdatedAt,
        errors: errors,
      });
    }
  }

  // sorting the output to make it deterministic and easy to navigate in the UI
  repoList.sort((a, b) => {
    if (a.name === undefined && b.name === undefined) {
      return 0;
    }
    if (a.name === undefined) {
      return -1;
    }
    if (b.name === undefined) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    statusCode: 200,
    responseBody: {
      errors: errorList,
      repositories: repoList,
      totalCount: allReposAccessible.totalCount,
    },
  };
}
