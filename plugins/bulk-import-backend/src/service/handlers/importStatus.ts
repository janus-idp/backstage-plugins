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

import type { Components } from '../../generated/openapi.d';
import type { GithubApiService } from '../githubApiService';
import { getCatalogUrl } from '../../catalog/catalogUtils';
import {CatalogHttpClient} from "../../catalog/catalogHttpClient";

export async function getImportStatusFromLocations(
    deps: {
        logger: LoggerService,
        config: Config,
        githubApiService: GithubApiService,
        catalogHttpClient: CatalogHttpClient,
    },
  repoUrl: string,
  catalogUrlLocations: string[],
  defaultBranch?: string,
): Promise<{
  status: Components.Schemas.ImportStatus;
  lastUpdate?: string;
} | null> {
  return getImportStatusWithCheckerFn(
    deps,
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
  deps: {
      logger: LoggerService,
      config: Config,
      githubApiService: GithubApiService,
      catalogHttpClient: CatalogHttpClient,
  },
  repoUrl: string,
  catalogExistenceCheckFn: (catalogUrl: string) => Promise<boolean>,
  defaultBranch?: string,
): Promise<{
  status: Components.Schemas.ImportStatus;
  lastUpdate?: string;
} | null> {
  // Check to see if there are any PR
  const openImportPr = await deps.githubApiService.findImportOpenPr(deps.logger, {
    repoUrl,
  });
  if (!openImportPr.prUrl) {
    const existsInCatalog = await catalogExistenceCheckFn(
      getCatalogUrl(deps.config, repoUrl, defaultBranch),
    );
    const existsInRepo =
      await deps.githubApiService.doesCatalogInfoAlreadyExistInRepo(deps.logger, {
        repoUrl,
        defaultBranch,
      });
    if (existsInCatalog && existsInRepo) {
      // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
      await deps.catalogHttpClient.refreshLocationByRepoUrl(
        repoUrl,
        defaultBranch,
      );
      return { status: 'ADDED' };
    }
    return null;
  }
  return { status: 'WAIT_PR_APPROVAL', lastUpdate: openImportPr.lastUpdate };
}
