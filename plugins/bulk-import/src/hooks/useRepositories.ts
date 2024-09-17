import React from 'react';
import { useAsync, useDebounce } from 'react-use';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import {
  useDebounceCallback,
  useDeepCompareMemoize,
} from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import {
  AddRepositoryData,
  OrgAndRepoResponse,
  RepositoriesError,
  Repository,
} from '../types';
import { getPRTemplate } from '../utils/repository-utils';

export const useRepositories = (options: {
  page: number;
  querySize: number;
  showOrganizations?: boolean;
  orgName?: string;
  searchString?: string;
}): {
  loading: boolean;
  data: {
    repositories?: { [id: string]: AddRepositoryData };
    organizations?: { [id: string]: AddRepositoryData };
    totalRepositories: number;
    totalOrganizations: number;
  } | null;
  error: RepositoriesError | undefined;
} => {
  const [repositoriesData, setRepositoriesData] = React.useState<{
    [id: string]: AddRepositoryData;
  }>({});
  const [totalOrganizations, setTotalOrganizations] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [debouncedSearch, setDebouncedSearch] = React.useState(
    options?.searchString,
  );
  const [totalRepositories, setTotalRepositories] = React.useState(0);
  const [organizationsData, setOrganizationsData] = React.useState<{
    [id: string]: AddRepositoryData;
  }>({});
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);

  useDebounce(
    () => {
      setDebouncedSearch(options?.searchString);
    },
    500,
    [options?.searchString],
  );

  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  const { value: baseUrl } = useAsync(async () => {
    const url = configApi.getString('app.baseUrl');
    return url;
  });

  const bulkImportApi = useApi(bulkImportApiRef);
  const { value, loading, error } = useAsync(async () => {
    setIsLoading(true);
    if (options.showOrganizations) {
      return await bulkImportApi.dataFetcher(
        options.page,
        options.querySize,
        debouncedSearch || '',
        {
          fetchOrganizations: true,
        },
      );
    }
    if (options.orgName) {
      return await bulkImportApi.dataFetcher(
        options.page,
        options.querySize,
        debouncedSearch || '',
        {
          orgName: options.orgName,
        },
      );
    }
    return await bulkImportApi.dataFetcher(
      options.page,
      options.querySize,
      debouncedSearch || '',
    );
  }, [
    options?.page,
    options?.querySize,
    options?.showOrganizations,
    options?.orgName,
    debouncedSearch,
  ]);

  const prepareData = React.useCallback(
    (result: OrgAndRepoResponse, dataLoading: boolean) => {
      const prepareDataForRepositories = () => {
        const repoData: { [id: string]: AddRepositoryData } =
          result?.repositories?.reduce((acc, val: Repository) => {
            const id = val.id || `${val.organization}/${val.name}`;
            return {
              ...acc,
              [id]: {
                id,
                repoName: val.name,
                defaultBranch: val.defaultBranch,
                orgName: val.organization,
                repoUrl: val.url,
                organizationUrl: val?.url?.substring(
                  0,
                  val.url.indexOf(val?.name || '') - 1,
                ),
                catalogInfoYaml: {
                  prTemplate: getPRTemplate(
                    val.name || '',
                    val.organization || '',
                    user as string,
                    baseUrl as string,
                    val.url || '',
                    val.defaultBranch || 'main',
                  ),
                },
              },
            };
          }, {}) || {};
        setRepositoriesData(repoData);
        setTotalRepositories(result?.totalCount);
        setIsLoading(false);
      };
      const prepareDataForOrganizations = () => {
        const orgData: { [id: string]: AddRepositoryData } =
          result?.organizations?.reduce(
            (acc: { [id: string]: AddRepositoryData }, val: Repository) => {
              return {
                ...acc,
                [val.id]: {
                  id: val.id,
                  orgName: val.name,
                  organizationUrl: `https://github.com/${val?.name}`,
                  totalReposInOrg: val.totalRepoCount,
                },
              };
            },
            {},
          ) || {};
        setOrganizationsData(orgData);
        setTotalOrganizations(result?.totalCount);
        setIsLoading(false);
      };
      if (!dataLoading)
        if (options?.showOrganizations) {
          prepareDataForOrganizations();
        } else {
          prepareDataForRepositories();
        }
    },
    [
      user,
      options?.showOrganizations,
      baseUrl,
      setRepositoriesData,
      setOrganizationsData,
      setTotalOrganizations,
      setTotalRepositories,
    ],
  );

  const debouncedUpdateResources = useDebounceCallback(prepareData, 200);

  React.useEffect(() => {
    debouncedUpdateResources?.(value, loading);
  }, [debouncedUpdateResources, value, loading]);

  return useDeepCompareMemoize({
    loading: isLoading,
    data: {
      repositories: repositoriesData,
      organizations: organizationsData,
      totalOrganizations: totalOrganizations,
      totalRepositories: totalRepositories,
    },
    error: {
      ...(error ?? {}),
      ...((value?.errors && value.errors.length > 0) ||
      (value as any as Response)?.statusText
        ? { errors: value?.errors || (value as any as Response)?.statusText }
        : {}),
    } as RepositoriesError,
  });
};
