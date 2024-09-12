import React from 'react';
import { useAsync } from 'react-use';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { AddRepositoryData, RepositoriesError, Repository } from '../types';
import { getPRTemplate } from '../utils/repository-utils';

export const useRepositories = (options: {
  page: number;
  querySize: number;
  showOrganizations?: boolean;
  orgName?: string;
}): {
  loading: boolean;
  data: {
    repositories?: AddRepositoryData[];
    organizations?: AddRepositoryData[];
    totalRepositories: number;
    totalOrganizations: number;
  } | null;
  error: RepositoriesError | undefined;
} => {
  const [repositoriesData, setRepositoriesData] = React.useState<
    AddRepositoryData[]
  >([]);
  const [organizationsData, setOrganizationsData] = React.useState<
    AddRepositoryData[]
  >([]);
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);

  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  const { value: baseUrl } = useAsync(async () => {
    const url = configApi.getString('app.baseUrl');
    return url;
  });

  const bulkImportApi = useApi(bulkImportApiRef);
  const {
    value,
    loading: dataLoading,
    error,
  } = useAsync(async () => {
    if (options.showOrganizations) {
      return await bulkImportApi.dataFetcher(options.page, options.querySize, {
        fetchOrganizations: true,
      });
    }
    if (options.orgName) {
      return await bulkImportApi.dataFetcher(options.page, options.querySize, {
        orgName: options.orgName,
      });
    }
    return await bulkImportApi.dataFetcher(options.page, options.querySize, {
      fetchRepositories: true,
    });
  }, [
    options?.page,
    options?.querySize,
    options?.showOrganizations,
    options?.orgName,
  ]);

  React.useEffect(() => {
    const prepareDataForRepositories = () => {
      const repoData: AddRepositoryData[] =
        value?.repositories?.map((val: Repository) => ({
          id: val.id || `${val.organization}/${val.name}`,
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
        })) || [];
      setRepositoriesData(repoData);
    };
    const prepareDataForOrganizations = () => {
      const orgData: AddRepositoryData[] =
        value?.organizations?.map((val: Repository) => ({
          id: val.id,
          orgName: val.name,
          organizationUrl: `https://github.com/${val?.name}`,
          totalReposInOrg: val.totalRepoCount,
        })) || [];
      setOrganizationsData(orgData);
    };
    if (options?.showOrganizations) {
      prepareDataForOrganizations();
    } else {
      prepareDataForRepositories();
    }
  }, [value, user, options?.showOrganizations, baseUrl]);

  return {
    loading: dataLoading,
    data: {
      repositories: repositoriesData,
      organizations: organizationsData,
      totalOrganizations:
        (value?.organizations || []).length > 0 ? value?.totalCount || 0 : 0,
      totalRepositories:
        (value?.repositories || []).length > 0 ? value?.totalCount || 0 : 0,
    },
    error: {
      ...(error ?? {}),
      ...((value?.errors && value.errors.length > 0) ||
      (value as any as Response)?.statusText
        ? { errors: value?.errors || (value as any as Response)?.statusText }
        : {}),
    } as RepositoriesError,
  };
};
