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

import {
  CatalogInfoGenerator,
  getCatalogFilename,
  getTokenForPlugin,
  paginateArray,
} from '../../helpers';
import { Components, Paths } from '../../openapi.d';
import { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  HandlerResponse,
} from './handlers';
import { hasEntityInCatalog, verifyLocationExistence } from './importStatus';

type CreateImportDryRunStatus =
  | 'CATALOG_ENTITY_CONFLICT'
  | 'CATALOG_INFO_FILE_EXISTS_IN_REPO'
  | 'CODEOWNERS_FILE_NOT_FOUND_IN_REPO'
  | 'REPO_EMPTY';

export async function findAllImports(
  logger: Logger,
  config: Config,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.Import[]>> {
  logger.debug('Getting all bulk import jobs..');

  const catalogFilename = getCatalogFilename(config);

  const allLocations = await catalogInfoGenerator.listCatalogUrlLocations(
    config,
    pageNumber,
    pageSize,
  );

  // resolve default branches for each unique repo URL from GH,
  // because we cannot easily determine that from the location target URL.
  // It can be 'main' or something more convoluted like 'our/awesome/main'.
  const defaultBranchByRepoUrl = await resolveReposDefaultBranches(
    logger,
    githubApiService,
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

  // now fetch the import statuses in different promises
  const importStatusPromises: Promise<
    HandlerResponse<Components.Schemas.Import>
  >[] = [];
  for (const loc of importCandidates) {
    const repoUrl = repoUrlFromLocation(loc);
    if (!repoUrl) {
      continue;
    }

    importStatusPromises.push(
      findImportStatusByRepo(
        logger,
        config,
        githubApiService,
        catalogInfoGenerator,
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
  return {
    statusCode: 200,
    responseBody: paginateArray(imports, pageNumber, pageSize).result,
  };
}

async function resolveReposDefaultBranches(
  logger: Logger,
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
          logger.debug(
            `Ignored repo ${repoUrl} due to an error while fetching details from GitHub: ${err}`,
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
  logger: Logger,
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
  reqParams: {
    importRequests: Paths.CreateImportJobs.RequestBody;
    dryRun?: boolean;
  },
): Promise<
  HandlerResponse<Components.Schemas.Import[] | { errors: string[] }>
> {
  const dryRun = reqParams.dryRun ?? false;
  const importRequests = reqParams.importRequests;
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

  const result: Components.Schemas.Import[] = [];
  for (const req of importRequests) {
    const gitUrl = gitUrlParse(req.repository.url);

    if (dryRun) {
      const dryRunChecks = await performDryRunChecks(
        logger,
        auth,
        catalogApi,
        githubApiService,
        req,
      );
      if (dryRunChecks.errors && dryRunChecks.errors.length > 0) {
        logger.warn(
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
    const repoCatalogUrl = catalogInfoGenerator.getCatalogUrl(
      config,
      req.repository.url,
      req.repository.defaultBranch,
    );
    const hasLocation = await verifyLocationExistence(
      auth,
      catalogApi,
      repoCatalogUrl,
    );
    if (
      hasLocation &&
      (await githubApiService.doesCatalogInfoAlreadyExistInRepo(logger, {
        repoUrl: req.repository.url,
        defaultBranch: req.repository.defaultBranch,
      }))
    ) {
      const ghRepo = await githubApiService.getRepositoryFromIntegrations(
        req.repository.url,
      );
      // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
      await catalogInfoGenerator.refreshLocationByRepoUrl(
        config,
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
        githubApiService,
        logger,
        req,
        gitUrl,
        catalogInfoGenerator,
        config,
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

        // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
        await catalogInfoGenerator.refreshLocationByRepoUrl(
          config,
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
  logger: Logger,
  auth: AuthService,
  catalogApi: CatalogApi,
  githubApiService: GithubApiService,
  req: Components.Schemas.ImportRequest,
): Promise<{ dryRunStatuses: CreateImportDryRunStatus[]; errors: string[] }> {
  const checkCatalog = async (
    catalogEntityName: string,
  ): Promise<{
    dryRunStatuses?: CreateImportDryRunStatus[];
    errors?: string[];
  }> => {
    const hasEntity = await hasEntityInCatalog(
      auth,
      catalogApi,
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
    const empty = await githubApiService.isRepoEmpty({
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
    const exists = await githubApiService.doesCatalogInfoAlreadyExistInRepo(
      logger,
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
    const exists = await githubApiService.doesCodeOwnersAlreadyExistInRepo(
      logger,
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
  logger: Logger,
  config: Config,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  defaultBranch?: string,
  includeCatalogInfoContent?: boolean,
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
      id: `${gitUrl.organization}/${gitUrl.name}`,
      defaultBranch,
    },
    approvalTool: 'GIT',
    status: null,
  } as Components.Schemas.Import;
  try {
    // Check to see if there are any PR
    const openImportPr = await githubApiService.findImportOpenPr(logger, {
      repoUrl: repoUrl,
      includeCatalogInfoContent,
    });
    if (!openImportPr.prUrl) {
      const catalogLocations =
        await catalogInfoGenerator.listCatalogUrlLocations(config);
      const catalogUrl = catalogInfoGenerator.getCatalogUrl(
        config,
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
        (await githubApiService.doesCatalogInfoAlreadyExistInRepo(logger, {
          repoUrl,
          defaultBranch,
        }))
      ) {
        result.status = 'ADDED';
        // Force a refresh of the Location, so that the entities from the catalog-info.yaml can show up quickly (not guaranteed however).
        await catalogInfoGenerator.refreshLocationByRepoUrl(
          config,
          repoUrl,
          defaultBranch,
        );
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
  logger: Logger,
  config: Config,
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
  const gitUrl = gitUrlParse(repoUrl);
  if (openImportPr.prUrl) {
    // Close PR
    const appTitle =
      config.getOptionalString('app.title') ?? 'Red Hat Developer Hub';
    const appBaseUrl = config.getString('app.baseUrl');
    await githubApiService.closePR(logger, {
      repoUrl,
      gitUrl,
      comment: `Closing PR upon request for bulk import deletion. This request was created from [${appTitle}](${appBaseUrl}).`,
    });
  }
  // Also delete the import branch, so that it is not outdated if we try later to import the repo again
  await githubApiService.deleteImportBranch(logger, {
    repoUrl,
    gitUrl,
  });
  // Remove Location from catalog
  const catalogUrl = catalogInfoGenerator.getCatalogUrl(
    config,
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
    await catalogInfoGenerator.listCatalogUrlLocationsByIdFromLocationsEndpoint(),
  );
  if (locationId) {
    await catalogInfoGenerator.deleteCatalogLocationById(locationId);
  }

  return {
    statusCode: 204,
    responseBody: undefined,
  };
}
