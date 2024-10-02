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

import type { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';

import { getTokenForPlugin, type CatalogInfoGenerator } from '../../helpers';
import type { Components } from '../../openapi';
import type { GithubApiService } from '../githubApiService';

export async function getImportStatusFromLocations(
  logger: LoggerService,
  config: Config,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  catalogUrlLocations: string[],
  defaultBranch?: string,
): Promise<{
  status: Components.Schemas.ImportStatus;
  lastUpdate?: string;
} | null> {
  return getImportStatusWithCheckerFn(
    logger,
    config,
    githubApiService,
    catalogInfoGenerator,
    repoUrl,
    async (catalogUrl: string) => {
      for (const loc of catalogUrlLocations) {
        if (catalogUrl === loc) {
          return true;
        }
      }
      return false;
    },
    defaultBranch,
  );
}

async function getImportStatusWithCheckerFn(
  logger: LoggerService,
  config: Config,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  catalogExistenceCheckFn: (catalogUrl: string) => Promise<boolean>,
  defaultBranch?: string,
): Promise<{
  status: Components.Schemas.ImportStatus;
  lastUpdate?: string;
} | null> {
  // Check to see if there are any PR
  const openImportPr = await githubApiService.findImportOpenPr(logger, {
    repoUrl,
  });
  if (!openImportPr.prUrl) {
    const existsInCatalog = await catalogExistenceCheckFn(
      catalogInfoGenerator.getCatalogUrl(config, repoUrl, defaultBranch),
    );
    const existsInRepo =
      await githubApiService.doesCatalogInfoAlreadyExistInRepo(logger, {
        repoUrl,
        defaultBranch,
      });
    if (existsInCatalog && existsInRepo) {
      // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
      await catalogInfoGenerator.refreshLocationByRepoUrl(
        config,
        repoUrl,
        defaultBranch,
      );
      return { status: 'ADDED' };
    }
    return null;
  }
  return { status: 'WAIT_PR_APPROVAL', lastUpdate: openImportPr.lastUpdate };
}

/**
 * verifyLocationExistence checks for the existence of the Location target.
 * Under the hood, it attempts to read the target URL and will return false if the target could not be found
 * and even if there is already a Location row in the database.
 * @param auth
 * @param catalogApi
 * @param repoCatalogUrl
 */
export async function verifyLocationExistence(
  auth: AuthService,
  catalogApi: CatalogApi,
  repoCatalogUrl: string,
): Promise<boolean> {
  try {
    const result = await catalogApi.addLocation(
      {
        type: 'url',
        target: repoCatalogUrl,
        dryRun: true,
      },
      {
        token: await getTokenForPlugin(auth, 'catalog'),
      },
    );
    // The `result.exists` field is only filled in dryRun mode
    return result.exists as boolean;
  } catch (error: any) {
    if (error.message?.includes('NotFoundError')) {
      return false;
    }
    throw error;
  }
}

export async function hasEntityInCatalog(
  auth: AuthService,
  catalogApi: CatalogApi,
  entityName: string,
) {
  return catalogApi
    .queryEntities(
      {
        filter: {
          'metadata.name': entityName,
        },
        limit: 1,
      },
      {
        token: await getTokenForPlugin(auth, 'catalog'),
      },
    )
    .then(resp => resp.items?.length > 0);
}
