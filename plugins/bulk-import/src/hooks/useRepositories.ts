import React from 'react';
import { useAsync } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { Repository } from '../types/response-types';
import { AddRepositoryData } from '../types/types';
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
  };
  error: Error | string[] | undefined;
} => {
  const [repositoriesData, setRepositoriesData] = React.useState<
    AddRepositoryData[]
  >([]);
  const [organizationsData, setOrganizationsData] = React.useState<
    AddRepositoryData[]
  >([]);
  const identityApi = useApi(identityApiRef);

  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  const bulkImportApi = useApi(bulkImportApiRef);
  const {
    value,
    loading: dataLoading,
    error,
  } = useAsync(async () => {
    if (options.showOrganizations) {
      return await bulkImportApi.getOrganizations(
        options.page,
        options.querySize,
      );
    }
    if (options.orgName) {
      return await bulkImportApi.getRepositoriesFromOrg(
        options.orgName,
        options.page,
        options.querySize,
      );
    }
    return await bulkImportApi.getRepositories(options.page, options.querySize);
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
            ),
          },
        })) || [];
      setRepositoriesData(repoData);
    };
    const prepareDataForOrganizations = () => {
      const orgData: AddRepositoryData[] =
        value?.organizations?.map((val: any) => ({
          id: val.id,
          orgName: val.name,
          organizationUrl: val.url.replace('api.', ''),
        })) || [];
      setOrganizationsData(orgData);
    };
    if (options?.showOrganizations) {
      prepareDataForOrganizations();
    } else {
      prepareDataForRepositories();
    }
  }, [value, user, options?.showOrganizations]);

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
    error: error ?? value?.errors,
  };
};
