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

import { Logger } from 'winston';

import { Components } from '../../openapi.d';
import { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  HandlerResponse,
} from './handlers';

export async function findAllOrganizations(
  logger: Logger,
  githubApiService: GithubApiService,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.OrganizationList>> {
  logger.debug(
    `Getting all organizations (page,size)=(${pageNumber},${pageSize})..`,
  );
  const allOrgsAccessible =
    await githubApiService.getOrganizationsFromIntegrations(
      pageNumber,
      pageSize,
    );
  const errorList: string[] = [];
  if (allOrgsAccessible.errors) {
    for (const err of allOrgsAccessible.errors) {
      if (err.error?.message) {
        errorList.push(err.error.message);
      }
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

  const orgMap = new Map<string, Components.Schemas.Organization>();
  if (allOrgsAccessible.organizations) {
    for (const org of allOrgsAccessible.organizations) {
      const errors: string[] = [];
      orgMap.set(org.name, {
        id: `${org.id}`,
        name: org.name,
        description: org.description,
        url: org.url,
        errors: errors,
      });
    }
  }

  return {
    statusCode: 200,
    responseBody: {
      errors: errorList,
      organizations: Array.from(orgMap.values()),
      totalCount: allOrgsAccessible.totalCount,
    },
  };
}
