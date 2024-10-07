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

import gitUrlParse from 'git-url-parse';

import {getCatalogFilename, getCatalogUrl} from '../../catalog/catalogUtils';
import type { CatalogInfoGenerator } from '../../catalog/catalogInfoGenerator';
import {
  logErrorIfNeeded,
  paginateArray,
} from '../../helpers';
import type { Components, Paths } from '../../generated/openapi.d';
import type { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  type HandlerResponse,
} from './handlers';
import {CatalogHttpClient} from "../../catalog/catalogHttpClient";

type CreateImportDryRunStatus =
  | 'CATALOG_ENTITY_CONFLICT'
  | 'CATALOG_INFO_FILE_EXISTS_IN_REPO'
  | 'CODEOWNERS_FILE_NOT_FOUND_IN_REPO'
  | 'REPO_EMPTY';

type FindAllImportsResponse =
  | Components.Schemas.Import[]
  | Components.Schemas.ImportJobListV2;

export async function findAllImports(
    deps: {
      logger: LoggerService,
      config: Config,
      githubApiService: GithubApiService,
      catalogHttpClient: CatalogHttpClient,
    },
  requestHeaders?: {
    apiVersion?: Paths.FindAllImports.Parameters.ApiVersion;
  },
  queryParams?: {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
  },
): Promise<HandlerResponse<FindAllImportsResponse>> {
  const apiVersion = requestHeaders?.apiVersion ?? 'v1';
  const search = queryParams?.search;
  const pageNumber = queryParams?.pageNumber ?? DefaultPageNumber;
  const pageSize = queryParams?.pageSize ?? DefaultPageSize;

  deps.logger.debug(
    `Getting all bulk import jobs (apiVersion=${apiVersion}, search=${search}, page=${pageNumber}, size=${pageSize})..`,
  );

  const catalogFilename = getCatalogFilename(deps.config);

  const allLocations = (
    await deps.catalogHttpClient.listCatalogUrlLocations(
       search,
      pageNumber,
      pageSize,
    )
  ).targetUrls;

  // resolve default branches for each unique repo URL from GH,
  // because we cannot easily determine that from the location target URL.
  // It can be 'main' or something more convoluted like 'our/awesome/main'.
  const defaultBranchByRepoUrl = await resolveReposDefaultBranches(
      deps.logger,
      deps.githubApiService,
    allLocations,
    catalogFilename,
  );

  // filter out locations that do not match what we are expecting, i.e.:
  // an URL to a catalog-info YAML file at the root of the repo
  const importCandidates = findImportCandidates(
    allLocations,
    defaultBranchByRepoUrl,
    catalogFilename,
  );

  // Keep only repos that are accessible from the configured GH integrations
  const importsReachableFromGHIntegrations =
    await deps.githubApiService.filterLocationsAccessibleFromIntegrations(
      importCandidates,
    );

  // now fetch the import statuses in different promises
  const importStatusPromises: Promise<
    HandlerResponse<Components.Schemas.Import>
  >[] = [];
  for (const loc of importsReachableFromGHIntegrations) {
    const repoUrl = repoUrlFromLocation(loc);
    if (!repoUrl) {
      continue;
    }

    importStatusPromises.push(
      findImportStatusByRepo(
        deps,
        repoUrl,
        defaultBranchByRepoUrl.get(repoUrl),
        false,
      ),
    );
  }

  const result = await Promise.all(importStatusPromises);
  const imports = result
    .filter(res => res.responseBody)
    .map(res => res.responseBody!);
  // sorting the output to make it deterministic and easy to navigate in the UI
  imports.sort((a, b) => {
    if (a.repository?.name === undefined && b.repository?.name === undefined) {
      return 0;
    }
    if (a.repository?.name === undefined) {
      return -1;
    }
    if (b.repository?.name === undefined) {
      return 1;
    }
    return a.repository.name.localeCompare(b.repository.name);
  });
  const paginated = paginateArray(imports, pageNumber, pageSize);
  if (apiVersion === 'v1') {
    return {
      statusCode: 200,
      responseBody: paginated.result,
    };
  }
  return {
    statusCode: 200,
    responseBody: {
      imports: paginated.result,
      totalCount: paginated.totalCount,
      page: pageNumber,
      size: pageSize,
    },
  };
}

async function resolveReposDefaultBranches(
  logger: LoggerService,
  githubApiService: GithubApiService,
  allLocations: string[],
  catalogFilename: string,
) {
  const defaultBranchByRepoUrlPromises: Promise<{
    repoUrl: string;
    defaultBranch?: string;
  }>[] = [];
  for (const loc of allLocations) {
    // loc has the following format: https://github.com/<org>/<repo>/blob/<default-branch>/catalog-info.yaml
    // but it can have a more convoluted format like 'https://github.com/janus-idp/backstage-plugins/blob/main/plugins/scaffolder-annotator-action/examples/templates/01-scaffolder-template.yaml'
    // if registered manually from the 'Register existing component' feature in Backstage.
    if (!loc.endsWith(catalogFilename)) {
      logger.debug(
        `Ignored location ${loc} because it does not point to a file named ${catalogFilename}`,
      );
      continue;
    }
    const repoUrl = repoUrlFromLocation(loc);
    if (!repoUrl) {
      continue;
    }
    defaultBranchByRepoUrlPromises.push(
      githubApiService
        .getRepositoryFromIntegrations(repoUrl)
        .then(resp => {
          return { repoUrl, defaultBranch: resp?.repository?.default_branch };
        })
        .catch((err: any) => {
          logErrorIfNeeded(
            logger,
            `Ignored repo ${repoUrl} due to an error while fetching details from GitHub`,
            err,
          );
          return {
            repoUrl,
            defaultBranch: undefined,
          };
        }),
    );
  }
  const defaultBranchesResponses = await Promise.all(
    defaultBranchByRepoUrlPromises,
  );
  return new Map(
    defaultBranchesResponses
      .flat()
      .filter(r => r.defaultBranch)
      .map(r => [r.repoUrl, r.defaultBranch!]),
  );
}

function repoUrlFromLocation(loc: string) {
  const split = loc.split('/blob/');
  if (split.length < 2) {
    return undefined;
  }
  return split[0];
}

function findImportCandidates(
  allLocations: string[],
  defaultBranchByRepoUrl: Map<string, string>,
  catalogFilename: string,
) {
  const filteredLocations: string[] = [];
  for (const loc of allLocations) {
    const repoUrl = repoUrlFromLocation(loc);
    if (!repoUrl) {
      continue;
    }

    const defaultBranch = defaultBranchByRepoUrl.get(repoUrl);
    if (!defaultBranch) {
      continue;
    }
    if (loc !== `${repoUrl}/blob/${defaultBranch}/${catalogFilename}`) {
      // Because users can use the "Register existing component" workflow to register a Location
      // using any file path in the repo, we consider a repository as an Import Location only
      // if it is at the root of the repository, because that is what the import PR ultimately does.
      continue;
    }
    filteredLocations.push(loc);
  }
  return filteredLocations;
}

async function createPR(
  githubApiService: GithubApiService,
  logger: LoggerService,
  req: Components.Schemas.ImportRequest,
  gitUrl: gitUrlParse.GitUrl,
  catalogInfoGenerator: CatalogInfoGenerator,
  config: Config,
) {
  const appTitle =
    config.getOptionalString('app.title') ?? 'Red Hat Developer Hub';
  const appBaseUrl = config.getString('app.baseUrl');
  const catalogFileName = getCatalogFilename(config);
  return await githubApiService.submitPrToRepo(logger, {
    repoUrl: req.repository.url,
    gitUrl: gitUrl,
    defaultBranch: req.repository.defaultBranch,
    catalogInfoContent:
      req.catalogInfoContent ??
      (await catalogInfoGenerator.generateDefaultCatalogInfoContent(
        req.repository.url,
      )),
    prTitle: req.github?.pullRequest?.title ?? `Add ${catalogFileName}`,
    prBody:
      req.github?.pullRequest?.body ??
      `
This pull request adds a **Backstage entity metadata file** to this repository so that the component can be added to a Backstage application.

After this pull request is merged, the component will become available in the [${appTitle} software catalog](${appBaseUrl}).

For more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/).
`,
  });
}

export async function createImportJobs(
    deps: {
      logger: LoggerService,
      config: Config,
      auth: AuthService,
      catalogApi: CatalogApi,
      githubApiService: GithubApiService,
      catalogInfoGenerator: CatalogInfoGenerator,
      catalogHttpClient: CatalogHttpClient,
    },
  reqParams: {
    importRequests: Paths.CreateImportJobs.RequestBody;
    dryRun?: boolean;
  },
): Promise<
  HandlerResponse<Components.Schemas.Import[] | { errors: string[] }>
> {
  const dryRun = reqParams.dryRun ?? false;
  const importRequests = reqParams.importRequests;
  deps.logger.debug(
    `Handling request to import ${importRequests?.length ?? 0} repo(s) (dryRun=${dryRun})..`,
  );

  if (!importRequests || importRequests.length === 0) {
    deps.logger.debug('Missing import requests from request body');
    return {
      statusCode: 400,
      responseBody: [],
    };
  }

  const result: Components.Schemas.Import[] = [];
  for (const req of importRequests) {
    const gitUrl = gitUrlParse(req.repository.url);

    if (dryRun) {
      const dryRunChecks = await performDryRunChecks(
          deps,
        req,
      );
      if (dryRunChecks.errors && dryRunChecks.errors.length > 0) {
        deps.logger.warn(
          `Errors while performing dry-run checks: ${dryRunChecks.errors}`,
        );
      }
      result.push({
        errors: dryRunChecks.dryRunStatuses,
        catalogEntityName: req.catalogEntityName,
        repository: {
          url: req.repository.url,
          name: gitUrl.name,
          organization: gitUrl.organization,
        },
      });
      continue;
    }

    // Check if repo is already imported
    const repoCatalogUrl = getCatalogUrl(
        deps.config,
      req.repository.url,
      req.repository.defaultBranch,
    );
    const hasLocation = await deps.catalogHttpClient.verifyLocationExistence(
      repoCatalogUrl,
    );
    if (
      hasLocation &&
      (await deps.githubApiService.doesCatalogInfoAlreadyExistInRepo(deps.logger, {
        repoUrl: req.repository.url,
        defaultBranch: req.repository.defaultBranch,
      }))
    ) {
      const ghRepo = await deps.githubApiService.getRepositoryFromIntegrations(
        req.repository.url,
      );
      // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
      await deps.catalogHttpClient.refreshLocationByRepoUrl(
          req.repository.url,
        req.repository.defaultBranch,
      );
      result.push({
        status: 'ADDED',
        lastUpdate: ghRepo?.repository?.updated_at ?? undefined,
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
          deps.githubApiService,
          deps.logger,
        req,
        gitUrl,
          deps.catalogInfoGenerator,
          deps.config,
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
        deps.logger.debug(`Created new PR from request: ${prToRepo.prUrl}`);
      }

      // Create Location
      await deps.catalogHttpClient.possiblyCreateLocation(repoCatalogUrl);

      if (prToRepo.hasChanges === false) {
        deps.logger.debug(
          `No bulk import PR created on ${req.repository.url} since its default branch (${req.repository.defaultBranch}) already contains a catalog-info file`,
        );

        // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
        await deps.catalogHttpClient.refreshLocationByRepoUrl(
          req.repository.url,
          req.repository.defaultBranch,
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

  return {
    statusCode: 202,
    responseBody: result,
  };
}

async function performDryRunChecks(
    deps: {
      logger: LoggerService,
      auth: AuthService,
      catalogApi: CatalogApi,
      githubApiService: GithubApiService,
      catalogHttpClient: CatalogHttpClient,
    },
  req: Components.Schemas.ImportRequest,
): Promise<{ dryRunStatuses: CreateImportDryRunStatus[]; errors: string[] }> {
  const checkCatalog = async (
    catalogEntityName: string,
  ): Promise<{
    dryRunStatuses?: CreateImportDryRunStatus[];
    errors?: string[];
  }> => {
    const hasEntity = await deps.catalogHttpClient.hasEntityInCatalog(
      catalogEntityName,
    );
    if (hasEntity) {
      return { dryRunStatuses: ['CATALOG_ENTITY_CONFLICT'] };
    }
    return {};
  };

  const checkEmptyRepo = async (): Promise<{
    dryRunStatuses?: CreateImportDryRunStatus[];
    errors?: string[];
  }> => {
    const empty = await deps.githubApiService.isRepoEmpty({
      repoUrl: req.repository.url,
    });
    if (empty) {
      return {
        dryRunStatuses: ['REPO_EMPTY'],
      };
    }
    return {};
  };

  const checkCatalogInfoPresenceInRepo = async (): Promise<{
    dryRunStatuses?: CreateImportDryRunStatus[];
    errors?: string[];
  }> => {
    const exists = await deps.githubApiService.doesCatalogInfoAlreadyExistInRepo(
        deps.logger,
      {
        repoUrl: req.repository.url,
        defaultBranch: req.repository.defaultBranch,
      },
    );
    if (exists) {
      return {
        dryRunStatuses: ['CATALOG_INFO_FILE_EXISTS_IN_REPO'],
      };
    }
    return {};
  };

  const checkCodeOwnersFileInRepo = async (): Promise<{
    dryRunStatuses?: CreateImportDryRunStatus[];
    errors?: string[];
  }> => {
    const exists = await deps.githubApiService.doesCodeOwnersAlreadyExistInRepo(
        deps.logger,
      {
        repoUrl: req.repository.url,
        defaultBranch: req.repository.defaultBranch,
      },
    );
    if (!exists) {
      return {
        dryRunStatuses: ['CODEOWNERS_FILE_NOT_FOUND_IN_REPO'],
      };
    }
    return {};
  };

  const dryRunStatuses: CreateImportDryRunStatus[] = [];
  const errors: string[] = [];
  const allChecksFn = [checkEmptyRepo(), checkCatalogInfoPresenceInRepo()];
  if (req.catalogEntityName?.trim()) {
    allChecksFn.push(checkCatalog(req.catalogEntityName));
  }
  if (req.codeOwnersFileAsEntityOwner) {
    allChecksFn.push(checkCodeOwnersFileInRepo());
  }
  const allChecks = await Promise.all(allChecksFn);
  allChecks.flat().forEach(res => {
    if (res.dryRunStatuses) {
      dryRunStatuses.push(...res.dryRunStatuses);
    }
    if (res.errors) {
      errors.push(...res.errors);
    }
  });

  dryRunStatuses.sort((a, b) => a.localeCompare(b));

  return {
    dryRunStatuses,
    errors,
  };
}

export async function findImportStatusByRepo(
    deps: {
      logger: LoggerService,
      config: Config,
      githubApiService: GithubApiService,
      catalogHttpClient: CatalogHttpClient,
    },
  repoUrl: string,
  defaultBranch?: string,
  includeCatalogInfoContent?: boolean,
): Promise<HandlerResponse<Components.Schemas.Import>> {
  deps.logger.debug(`Getting bulk import job status for ${repoUrl}..`);

  const gitUrl = gitUrlParse(repoUrl);

  const errors: string[] = [];
  const result = {
    id: repoUrl,
    repository: {
      url: repoUrl,
      name: gitUrl.name,
      organization: gitUrl.organization,
      id: `${gitUrl.organization}/${gitUrl.name}`,
      defaultBranch,
    },
    approvalTool: 'GIT',
    status: null,
  } as Components.Schemas.Import;
  try {
    // Check to see if there are any PR
    const openImportPr = await deps.githubApiService.findImportOpenPr(deps.logger, {
      repoUrl: repoUrl,
      includeCatalogInfoContent,
    });
    if (!openImportPr.prUrl) {
      const catalogLocations = (
        await deps.catalogHttpClient.listCatalogUrlLocations()
      ).targetUrls;
      const catalogUrl = getCatalogUrl(
          deps.config,
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
      if (
        exists &&
        (await deps.githubApiService.doesCatalogInfoAlreadyExistInRepo(deps.logger, {
          repoUrl,
          defaultBranch,
        }))
      ) {
        result.status = 'ADDED';
        // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
        await deps.catalogHttpClient.refreshLocationByRepoUrl(
             repoUrl,
          defaultBranch,
        );
      }
      // No import PR => let's determine last update from the repository
      const ghRepo =
        await deps.githubApiService.getRepositoryFromIntegrations(repoUrl);
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
        title: openImportPr.prTitle,
        body: openImportPr.prBody,
        catalogInfoContent: openImportPr.prCatalogInfoContent,
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
    deps: {
      logger: LoggerService,
      config: Config,
      githubApiService: GithubApiService,
      catalogHttpClient: CatalogHttpClient,
    },
  repoUrl: string,
  defaultBranch?: string,
): Promise<HandlerResponse<void>> {
  deps.logger.debug(`Deleting bulk import job status for ${repoUrl}..`);

  // Check to see if there are any PR
  const openImportPr = await deps.githubApiService.findImportOpenPr(deps.logger, {
    repoUrl: repoUrl,
  });
  const gitUrl = gitUrlParse(repoUrl);
  if (openImportPr.prUrl) {
    // Close PR
    const appTitle =
        deps.config.getOptionalString('app.title') ?? 'Red Hat Developer Hub';
    const appBaseUrl = deps.config.getString('app.baseUrl');
    await deps.githubApiService.closePR(deps.logger, {
      repoUrl,
      gitUrl,
      comment: `Closing PR upon request for bulk import deletion. This request was created from [${appTitle}](${appBaseUrl}).`,
    });
  }
  // Also delete the import branch, so that it is not outdated if we try later to import the repo again
  await deps.githubApiService.deleteImportBranch(deps.logger, {
    repoUrl,
    gitUrl,
  });
  // Remove Location from catalog
  const catalogUrl = getCatalogUrl(
      deps.config,
    repoUrl,
    defaultBranch,
  );
  const findLocationFrom = (list: { id?: string; target: string }[]) => {
    for (const loc of list) {
      if (loc.target === catalogUrl) {
        return loc.id;
      }
    }
    return undefined;
  };

  const locationId = findLocationFrom(
    (
      await deps.catalogHttpClient.listCatalogUrlLocationsByIdFromLocationsEndpoint()
    ).locations,
  );
  if (locationId) {
    await deps.catalogHttpClient.deleteCatalogLocationById(locationId);
  }

  return {
    statusCode: 204,
    responseBody: undefined,
  };
}
