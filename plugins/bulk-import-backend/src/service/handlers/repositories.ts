import gitUrlParse from 'git-url-parse';
import { Logger } from 'winston';

import { CatalogInfoGenerator } from '../../helpers';
import { Components } from '../../openapi.d';
import { GithubApiService } from '../githubApiService';
import {
  DefaultPageNumber,
  DefaultPageSize,
  HandlerResponse,
} from './handlers';
import { getImportStatusFromLocations } from './importStatus';

export async function findAllRepositories(
  logger: Logger,
  githubApiService: GithubApiService,
  catalogInfoGenerator: CatalogInfoGenerator,
  checkStatus: boolean,
  pageNumber: number = DefaultPageNumber,
  pageSize: number = DefaultPageSize,
): Promise<HandlerResponse<Components.Schemas.RepositoryList>> {
  logger.debug(
    `Getting all repositories (page,size)=(${pageNumber},${pageSize})..`,
  );
  const allReposAccessible =
    await githubApiService.getRepositoriesFromIntegrations(
      pageNumber,
      pageSize,
    );
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

  const catalogLocations = await catalogInfoGenerator.listCatalogUrlLocations();
  const repoList: Components.Schemas.Repository[] = [];
  if (allReposAccessible.repositories) {
    for (const repo of allReposAccessible.repositories) {
      const gitUrl = gitUrlParse(repo.html_url);
      let importStatus: Components.Schemas.ImportStatus | undefined;
      const errors: string[] = [];
      try {
        importStatus = checkStatus
          ? await getImportStatusFromLocations(
              logger,
              githubApiService,
              catalogInfoGenerator,
              repo.html_url,
              catalogLocations,
              repo.default_branch,
            )
          : undefined;
      } catch (error: any) {
        errors.push(error.message);
      }
      repoList.push({
        id: `${gitUrl.organization}/${repo.name}`,
        name: repo.name,
        organization: gitUrl.organization,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
        importStatus: importStatus,
        errors: errors,
      });
    }
  }

  return {
    statusCode: 200,
    responseBody: {
      errors: errorList,
      repositories: repoList,
      totalCount: allReposAccessible.totalCount,
    },
  };
}
