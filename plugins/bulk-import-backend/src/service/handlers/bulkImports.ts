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

import { AuthService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';

import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator, getTokenForPlugin } from '../../helpers';
import { Components, Paths } from '../../openapi.d';
import { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  HandlerResponse,
} from './handlers';
import { hasEntityInCatalog, verifyLocationExistence } from './importStatus';
import { findAllRepositories } from './repositories';

export async function findAllImports(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.Import[]>> {
  logger.debug('Getting all bulk import jobs..');
  const result: Components.Schemas.Import[] = [];
  const catalogLocations = await catalogInfoGenerator.listCatalogUrlLocations();
  const repos = await findAllRepositories(
    logger,
    githubApiService,
    catalogInfoGenerator,
    false,
    pageNumber,
    pageSize,
  );
  for (const repo of repos.responseBody?.repositories ?? []) {
    if (!repo.url) {
      continue;
    }
    const catalogUrl = catalogInfoGenerator.getCatalogUrl(
      repo.url,
      repo.defaultBranch,
    );
    const errors: string[] = [];
    try {
      // Check to see if there are any PR
      const openImportPr = await githubApiService.findImportOpenPr(logger, {
        repoUrl: repo.url,
      });
      if (!openImportPr.prUrl) {
        let exists = false;
        for (const loc of catalogLocations) {
          if (loc === catalogUrl) {
            exists = true;
            break;
          }
        }
        if (exists) {
          result.push({
            id: repo.id,
            status: 'ADDED',
            repository: repo,
            approvalTool: 'GIT',
            lastUpdate: repo.lastUpdate,
          });
        }
        // No import PR
        continue;
      }
      result.push({
        id: repo.id,
        status: 'WAIT_PR_APPROVAL',
        repository: repo,
        approvalTool: 'GIT',
        github: {
          pullRequest: {
            number: openImportPr.prNum,
            url: openImportPr.prUrl,
          },
        },
        lastUpdate: openImportPr.lastUpdate,
      });
    } catch (error: any) {
      errors.push(error.message);

      result.push({
        id: repo.id,
        status: 'PR_ERROR',
        errors: errors,
        repository: repo,
        approvalTool: 'GIT',
        lastUpdate: repo.lastUpdate,
      });
    }
  }

  return {
    statusCode: 200,
    responseBody: result,
  };
}

async function createPR(
  githubApiService: GithubApiService,
  logger: Logger,
  req: Components.Schemas.ImportRequest,
  gitUrl: gitUrlParse.GitUrl,
  catalogInfoGenerator: CatalogInfoGenerator,
  appTitle: string,
  appBaseUrl: string,
) {
  return await githubApiService.submitPrToRepo(logger, {
    repoUrl: req.repository.url,
    gitUrl: gitUrl,
    defaultBranch: req.repository.defaultBranch,
    catalogInfoContent:
      req.catalogInfoContent ??
      (await catalogInfoGenerator.generateDefaultCatalogInfoContent(
        req.repository.url,
      )),
    prTitle: req.github?.pullRequest?.title ?? `Add catalog-info.yaml`,
    prBody:
      req.github?.pullRequest?.body ??
      `
This pull request adds a **Backstage entity metadata file** to this repository so that the component can be added to a Backstage application.

After this pull request is merged, the component will become available in the [${appTitle} software catalog](${appBaseUrl}).

For more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).
`,
  });
}

async function possiblyCreateLocation(
  auth: AuthService,
  catalogApi: CatalogApi,
  repoCatalogUrl: string,
) {
  try {
    await catalogApi.addLocation(
      {
        type: 'url',
        target: repoCatalogUrl,
      },
      {
        token: await getTokenForPlugin(auth, 'catalog'),
      },
    );
  } catch (error: any) {
    if (!error.message?.includes('ConflictError')) {
      throw error;
    }
    // Location already exists, which is fine
  }
}

export async function createImportJobs(
  logger: Logger,
  config: Config,
  auth: AuthService,
  catalogApi: CatalogApi,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  importRequests: Paths.CreateImportJobs.RequestBody,
  dryRun: boolean = false,
): Promise<
  HandlerResponse<Components.Schemas.Import[] | { errors: string[] }>
> {
  logger.debug(
    `Handling request to import ${importRequests?.length ?? 0} repo(s) (dryRun=${dryRun})..`,
  );

  if (!importRequests || importRequests.length === 0) {
    logger.debug('Missing import requests from request body');
    return {
      statusCode: 400,
      responseBody: [],
    };
  }

  const appTitle =
    config.getOptionalString('app.title') ?? 'Red Hat Developer Hub';
  const appBaseUrl = config.getString('app.baseUrl');

  const result: Components.Schemas.Import[] = [];
  const dryRunErrors: string[] = [];
  for (const req of importRequests) {
    const gitUrl = gitUrlParse(req.repository.url);

    if (dryRun) {
      if (!req.catalogEntityName || req.catalogEntityName.trim().length === 0) {
        dryRunErrors.push(
          `ERROR: 'catalogEntityName' field must be specified in request body for ${req.repository.url} for dry-run operations`,
        );
      } else {
        const errs: string[] = [];
        const hasEntity = await hasEntityInCatalog(
          auth,
          catalogApi,
          req.catalogEntityName,
        );
        if (hasEntity) {
          errs.push('CONFLICT');
        }
        result.push({
          errors: errs,
          catalogEntityName: req.catalogEntityName,
          repository: {
            url: req.repository.url,
            name: gitUrl.name,
            organization: gitUrl.organization,
          },
        });
      }
      continue;
    }

    // Check if repo is already imported
    const repoCatalogUrl = catalogInfoGenerator.getCatalogUrl(
      req.repository.url,
      req.repository.defaultBranch,
    );
    const hasLocation = await verifyLocationExistence(
      auth,
      catalogApi,
      repoCatalogUrl,
    );
    if (hasLocation) {
      const ghRepo = await githubApiService.getRepositoryFromIntegrations(
        req.repository.url,
      );
      result.push({
        status: 'ADDED',
        lastUpdate: ghRepo.repository?.updated_at ?? undefined,
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
      });
      continue;
    }

    // Create PR
    try {
      const prToRepo = await createPR(
        githubApiService,
        logger,
        req,
        gitUrl,
        catalogInfoGenerator,
        appTitle,
        appBaseUrl,
      );
      if (prToRepo.errors && prToRepo.errors.length > 0) {
        result.push({
          errors: prToRepo.errors,
          status: 'PR_ERROR',
          repository: req.repository,
        });
        continue;
      }
      if (prToRepo.prUrl) {
        logger.debug(`Created new PR from request: ${prToRepo.prUrl}`);
      }

      // Create Location
      await possiblyCreateLocation(auth, catalogApi, repoCatalogUrl);

      if (prToRepo.hasChanges === false) {
        logger.debug(
          `No bulk import PR created on ${req.repository.url} since its default branch (${req.repository.defaultBranch}) already contains a catalog-info file`,
        );
        result.push({
          status: 'ADDED',
          lastUpdate: prToRepo.lastUpdate,
          repository: {
            url: req.repository.url,
            name: gitUrl.name,
            organization: gitUrl.organization,
          },
        });
        continue;
      }

      result.push({
        errors: prToRepo.errors,
        status: 'WAIT_PR_APPROVAL',
        lastUpdate: prToRepo.lastUpdate,
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
        github: {
          pullRequest: {
            url: prToRepo.prUrl,
            number: prToRepo.prNumber,
          },
        },
      });
    } catch (error: any) {
      result.push({
        errors: [error.message],
        status: 'PR_ERROR',
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
      } as Components.Schemas.Import);
    }
  }

  if (dryRun && dryRunErrors.length > 0) {
    return {
      statusCode: 400,
      responseBody: {
        errors: dryRunErrors,
      },
    };
  }

  return {
    statusCode: 202,
    responseBody: result,
  };
}

export async function findImportStatusByRepo(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  defaultBranch?: string,
): Promise<HandlerResponse<Components.Schemas.Import>> {
  logger.debug(`Getting bulk import job status for ${repoUrl}..`);

  const gitUrl = gitUrlParse(repoUrl);

  const errors: string[] = [];
  const result = {
    id: repoUrl,
    repository: {
      url: repoUrl,
      name: gitUrl.name,
      organization: gitUrl.organization,
    },
    approvalTool: 'GIT',
    status: null,
  } as Components.Schemas.Import;
  try {
    // Check to see if there are any PR
    const openImportPr = await githubApiService.findImportOpenPr(logger, {
      repoUrl: repoUrl,
    });
    if (!openImportPr.prUrl) {
      const catalogLocations =
        await catalogInfoGenerator.listCatalogUrlLocations();
      const catalogUrl = catalogInfoGenerator.getCatalogUrl(
        repoUrl,
        defaultBranch,
      );
      let exists = false;
      for (const loc of catalogLocations) {
        if (loc === catalogUrl) {
          exists = true;
          break;
        }
      }
      if (exists) {
        result.status = 'ADDED';
      }
      // No import PR => let's determine last update from the repository
      const ghRepo =
        await githubApiService.getRepositoryFromIntegrations(repoUrl);
      result.lastUpdate = ghRepo.repository?.updated_at ?? undefined;
      return {
        statusCode: 200,
        responseBody: result,
      };
    }
    result.status = 'WAIT_PR_APPROVAL';
    result.github = {
      pullRequest: {
        number: openImportPr.prNum,
        url: openImportPr.prUrl,
      },
    };
    result.lastUpdate = openImportPr.lastUpdate;
  } catch (error: any) {
    errors.push(error.message);
    result.errors = errors;
    if (error.message?.includes('Not Found')) {
      return {
        statusCode: 404,
        responseBody: result,
      };
    }
    result.status = 'PR_ERROR';
  }

  return {
    statusCode: 200,
    responseBody: result,
  };
}

export async function deleteImportByRepo(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  defaultBranch?: string,
): Promise<HandlerResponse<void>> {
  logger.debug(`Deleting bulk import job status for ${repoUrl}..`);

  // Check to see if there are any PR
  const openImportPr = await githubApiService.findImportOpenPr(logger, {
    repoUrl: repoUrl,
  });
  if (openImportPr.prUrl) {
    // Close PR
    await githubApiService.closePR(logger, {
      repoUrl,
      gitUrl: gitUrlParse(repoUrl),
      comment: `Closing PR upon request for bulk import deletion`,
    });
  }
  // Remove Location from catalog
  const catalogLocations =
    await catalogInfoGenerator.listCatalogUrlLocationsById();
  const catalogUrl = catalogInfoGenerator.getCatalogUrl(repoUrl, defaultBranch);
  let locationId: string | undefined;
  for (const [id, loc] of catalogLocations) {
    if (loc === catalogUrl) {
      locationId = id;
      break;
    }
  }
  if (locationId) {
    await catalogInfoGenerator.deleteCatalogLocationById(locationId);
  }

  return {
    statusCode: 204,
    responseBody: undefined,
  };
}
