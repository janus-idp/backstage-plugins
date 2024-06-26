import { CatalogApi } from '@backstage/catalog-client';

import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { Components } from '../../openapi';
import { GithubApiService } from '../githubApiService';

export async function getImportStatus(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogApi: CatalogApi,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  defaultBranch?: string,
): Promise<Components.Schemas.ImportStatus> {
  return getImportStatusWithCheckerFn(
    logger,
    githubApiService,
    catalogInfoGenerator,
    repoUrl,
    async (catalogUrl: string) =>
      await verifyLocationExistence(catalogApi, catalogUrl),
    defaultBranch,
  );
}

export async function getImportStatusFromLocations(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  catalogUrlLocations: string[],
  defaultBranch?: string,
): Promise<Components.Schemas.ImportStatus> {
  return getImportStatusWithCheckerFn(
    logger,
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
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  repoUrl: string,
  catalogExistenceCheckFn: (catalogUrl: string) => Promise<boolean>,
  defaultBranch?: string,
): Promise<Components.Schemas.ImportStatus> {
  // Check to see if there are any PR
  const openImportPr = await githubApiService.findImportOpenPr(logger, {
    repoUrl,
  });
  if (!openImportPr.prUrl) {
    if (
      await catalogExistenceCheckFn(
        catalogInfoGenerator.getCatalogUrl(repoUrl, defaultBranch),
      )
    ) {
      return 'ADDED';
    }
    return null;
  }
  return 'WAIT_PR_APPROVAL';
}

/**
 * verifyLocationExistence checks for the existence of the Location target.
 * Under the hood, it attempts to read the target URL and will return false if the target could not be found
 * and even if there is already a Location row in the database.
 * @param catalogApi
 * @param repoCatalogUrl
 */
export async function verifyLocationExistence(
  catalogApi: CatalogApi,
  repoCatalogUrl: string,
): Promise<boolean> {
  try {
    const result = await catalogApi.addLocation({
      type: 'url',
      target: repoCatalogUrl,
      dryRun: true,
    });
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
  catalogApi: CatalogApi,
  entityName: string,
) {
  return catalogApi
    .queryEntities({
      filter: {
        'metadata.name': entityName,
      },
      limit: 1,
    })
    .then(resp => resp.items?.length > 0);
}
