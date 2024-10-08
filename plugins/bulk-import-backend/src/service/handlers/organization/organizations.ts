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

import type { Components } from '../../../generated/openapi';
import type {
  GithubApiService,
  GithubOrganizationResponse,
} from '../../../github';
import {
  DefaultPageNumber,
  DefaultPageSize,
  type HandlerResponse,
} from '../handlers';

export async function findAllOrganizations(
  logger: LoggerService,
  githubApiService: GithubApiService,
  search?: string,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.OrganizationList>> {
  logger.debug(
    `Getting all organizations (search,page,size)=('${search ?? ''}',${pageNumber},${pageSize})..`,
  );
  const allOrgsAccessible =
    await githubApiService.getOrganizationsFromIntegrations(
      search,
      pageNumber,
      pageSize,
    );
  const errorList: string[] = [];
  for (const err of allOrgsAccessible.errors ?? []) {
    if (err.error?.message) {
      errorList.push(err.error.message);
    }
  }
  if (allOrgsAccessible.organizations?.length === 0 && errorList.length > 0) {
    return {
      statusCode: 500,
      responseBody: {
        errors: errorList,
      },
    };
  }

  const orgMap = extractOrgMap(allOrgsAccessible);

  // sorting the output to make it deterministic and easy to navigate in the UI
  const organizations = sortOrgs(orgMap);

  return {
    statusCode: 200,
    responseBody: {
      errors: errorList,
      organizations,
      totalCount: allOrgsAccessible.totalCount,
      pagePerIntegration: pageNumber,
      sizePerIntegration: pageSize,
    },
  };
}

function extractOrgMap(allOrgsAccessible: GithubOrganizationResponse) {
  const orgMap = new Map<string, Components.Schemas.Organization>();
  for (const org of allOrgsAccessible.organizations ?? []) {
    let totalRepoCount: number | undefined;
    if (
      org.public_repos !== undefined ||
      org.total_private_repos !== undefined ||
      org.owned_private_repos !== undefined
    ) {
      totalRepoCount =
        (org.public_repos ?? 0) +
        (org.owned_private_repos ?? org.total_private_repos ?? 0);
    }
    orgMap.set(org.name, {
      id: `${org.id}`,
      name: org.name,
      description: org.description,
      url: org.url,
      totalRepoCount,
      errors: [],
    });
  }
  return orgMap;
}

function sortOrgs(orgMap: Map<string, Components.Schemas.Organization>) {
  const organizations = Array.from(orgMap.values());
  organizations.sort((a, b) => {
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
  return organizations;
}
