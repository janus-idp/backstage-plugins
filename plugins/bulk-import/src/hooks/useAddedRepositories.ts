import React from 'react';
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import { AddRepositoryData, ImportJobStatus, RepositoryStatus } from '../types';
import { getPRTemplate } from '../utils/repository-utils';

export const useAddedRepositories = (
  page: number,
  rowsPerPage: number,
  pollInterval?: number,
): {
  loading: boolean;
  data: AddRepositoryData[];
  error: any;
  retry: () => void;
} => {
  const [addedRepositoriesData, setAddedRepositoriesData] = React.useState<
    AddRepositoryData[]
  >([]);
  const identityApi = useApi(identityApiRef);
  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  const bulkImportApi = useApi(bulkImportApiRef);
  const {
    value: addedRepositories,
    loading,
    error,
    retry,
  } = useAsyncRetry(
    async () => await bulkImportApi.getImportJobs(page, rowsPerPage),
  );

  React.useEffect(() => {
    const prepareDataForAddedRepositories = () => {
      if (!Array.isArray(addedRepositories)) {
        setAddedRepositoriesData([]);
      } else {
        const repoData: AddRepositoryData[] =
          addedRepositories?.map((val: ImportJobStatus) => ({
            id: val.id,
            repoName: val.repository.name,
            defaultBranch: val.repository.defaultBranch,
            orgName: val.repository.organization,
            repoUrl: val.repository.url,
            organizationUrl: val?.repository?.url?.substring(
              0,
              val.repository.url.indexOf(val?.repository?.name || '') - 1,
            ),
            catalogInfoYaml: {
              status: val.status
                ? RepositoryStatus[val.status as RepositoryStatus]
                : RepositoryStatus.NotGenerated,
              prTemplate: getPRTemplate(
                val.repository.name || '',
                val.repository.organization || '',
                user as string,
              ),
              pullRequest: val?.github?.pullRequest?.url || '',
              lastUpdated: val.lastUpdate,
            },
          })) || [];
        setAddedRepositoriesData(repoData);
      }
    };
    prepareDataForAddedRepositories();
  }, [addedRepositories, user]);

  useInterval(
    () => {
      retry();
    },
    loading ? null : pollInterval || 20000,
  );

  return {
    loading,
    data: addedRepositoriesData,
    error: {
      ...(error ?? {}),
      ...((addedRepositories as any as Response)?.statusText
        ? {
            name: 'Error',
            message: (addedRepositories as any as Response)?.statusText,
          }
        : {}),
    },
    retry,
  };
};
