import React from 'react';
import { useAsync, useAsyncRetry, useDebounce, useInterval } from 'react-use';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import { useFormikContext } from 'formik';

import {
  useDebounceCallback,
  useDeepCompareMemoize,
} from '@janus-idp/shared-react';

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
  searchString: string,
  pollInterval?: number,
): {
  loaded: boolean;
  data: AddRepositoryData[];
  error: any;
  retry: () => void;
} => {
  const [addedRepositoriesData, setAddedRepositoriesData] = React.useState<
    AddRepositoryData[]
  >([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchString);
  const [errorState, setErrorState] = React.useState<
    { [key: string]: string | undefined } | undefined
  >();
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);
  const mounted = React.useRef(false);
  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  useDebounce(
    () => {
      setDebouncedSearch(searchString);
    },
    200,
    [searchString],
  );

  const { value: baseUrl } = useAsync(async () => {
    const url = configApi.getString('app.baseUrl');
    return url;
  });

  const bulkImportApi = useApi(bulkImportApiRef);
  const { setFieldValue } = useFormikContext<AddRepositoriesFormValues>();
  const { value, loading, error, retry } = useAsyncRetry(
    async () =>
      await bulkImportApi.getImportJobs(page, rowsPerPage, searchString),
    [page, rowsPerPage, debouncedSearch],
  );

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const prepareDataForAddedRepositories = React.useCallback(
    (
      addedRepositories: ImportJobStatus[] | Response,
      isLoading: boolean,
      errorData: { [key: string]: string | undefined } | undefined,
    ) => {
      if (!isLoading && !errorData && mounted.current) {
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
                      val.repository.defaultBranch || 'main',
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
        setLoaded(true);
      } else if (errorData && mounted.current) {
        setLoaded(true);
        setErrorState({
          ...(errorData ?? {}),
          ...((addedRepositories as Response)?.statusText
            ? {
                name: 'Error',
                message: (addedRepositories as Response)?.statusText,
              }
            : {}),
        });
      }
    },
    [
      user,
      baseUrl,
      setFieldValue,
      setAddedRepositoriesData,
      setErrorState,
      setLoaded,
    ],
  );

  const debouncedUpdateResources = useDebounceCallback(
    prepareDataForAddedRepositories,
    250,
  );

  React.useEffect(() => {
    debouncedUpdateResources?.(value, loading, error);
  }, [debouncedUpdateResources, value, loading, error]);

  useInterval(
    () => {
      retry();
    },
    loading ? null : pollInterval || 60000,
  );

  return useDeepCompareMemoize({
    data: addedRepositoriesData,
    loaded,
    error: errorState,
    retry,
  });
};
