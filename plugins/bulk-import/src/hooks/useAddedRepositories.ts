import React from 'react';
import { useAsync, useDebounce } from 'react-use';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import { useQuery } from '@tanstack/react-query';
import { useFormikContext } from 'formik';

import {
  useDebounceCallback,
  useDeepCompareMemoize,
} from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import {
  AddRepositoriesFormValues,
  AddRepositoryData,
  ImportJobs,
} from '../types';
import { prepareDataForAddedRepositories } from '../utils/repository-utils';

export const useAddedRepositories = (
  pageNumber: number,
  rowsPerPage: number,
  searchString: string,
  pollInterval?: number,
): {
  loaded: boolean;
  data: {
    addedRepositories: AddRepositoryData[];
    totalJobs: number;
  };
  error: any;
  refetch: () => void;
} => {
  const [addedRepositoriesData, setAddedRepositoriesData] = React.useState<{
    [id: string]: AddRepositoryData;
  }>({});
  const [totalImportJobs, setTotalImportJobs] = React.useState(0);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchString);
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);
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
  const fetchAddedRepositories = async (
    page: number,
    size: number,
    searchStr: string,
  ) => {
    const response = await bulkImportApi.getImportJobs(page, size, searchStr);
    return response;
  };

  const {
    data: value,
    error,
    isLoading: loading,
    refetch,
  } = useQuery(
    ['importJobs', pageNumber, rowsPerPage, debouncedSearch],
    () => fetchAddedRepositories(pageNumber, rowsPerPage, debouncedSearch),
    { keepPreviousData: true, refetchInterval: pollInterval || 60000 },
  );

  const prepareData = React.useCallback(
    (addedRepositories: ImportJobs | Response, isLoading: boolean) => {
      if (!isLoading) {
        const repoData = prepareDataForAddedRepositories(
          addedRepositories,
          user as string,
          baseUrl as string,
        );
        setAddedRepositoriesData(repoData);
        setFieldValue(`repositories`, repoData);
        setTotalImportJobs((addedRepositories as ImportJobs)?.totalCount || 0);
        setLoaded(true);
      }
    },
    [
      user,
      baseUrl,
      setFieldValue,
      setAddedRepositoriesData,
      setTotalImportJobs,
    ],
  );

  const debouncedUpdateResources = useDebounceCallback(prepareData, 250);

  React.useEffect(() => {
    debouncedUpdateResources?.(value, loading);
  }, [debouncedUpdateResources, value, loading]);

  return useDeepCompareMemoize({
    data: {
      addedRepositories: Object.values(addedRepositoriesData),
      totalJobs: totalImportJobs,
    },
    loaded,
    error: {
      ...(error ?? {}),
      ...((value as Response)?.statusText
        ? {
            name: 'Error',
            message: (value as Response)?.statusText,
          }
        : {}),
    },
    refetch,
  });
};
