import React from 'react';
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ImportJobStatus,
  RepositoryStatus,
} from '../types';
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
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();
  const {
    value: addedRepositories,
    loading,
    error,
    retry,
  } = useAsyncRetry(
    async () => await bulkImportApi.getImportJobs(page, rowsPerPage),
    [page, rowsPerPage],
  );

  React.useEffect(() => {
    const prepareDataForAddedRepositories = () => {
      if (!Array.isArray(addedRepositories)) {
        setAddedRepositoriesData([]);
      } else {
        const repoData: { [id: string]: AddRepositoryData } =
          addedRepositories?.reduce((acc, val: ImportJobStatus) => {
            const id = `${val.repository.organization}/${val.repository.name}`;
            return {
              ...acc,
              [id]: {
                id,
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
                    baseUrl as string,
                    val.repository.url || '',
                  ),
                  pullRequest: val?.github?.pullRequest?.url || '',
                  lastUpdated: val.lastUpdate,
                },
              },
            };
          }, {});
        setFieldValue(`repositories`, repoData);
        setAddedRepositoriesData(Object.values(repoData));
      }
    };
    prepareDataForAddedRepositories();
  }, [addedRepositories, user, baseUrl, setFieldValue]);

  useInterval(
    () => {
      retry();
    },
    loading ? null : pollInterval || 60000,
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
