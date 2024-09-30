import React from 'react';
import { useAsync } from 'react-use';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';

import { useQuery } from '@tanstack/react-query';

import { bulkImportApiRef } from '../api/BulkImportBackendClient';
import {
  AddRepositoryData,
  DataFetcherQueryParams,
  OrgAndRepoResponse,
  RepositoriesError,
} from '../types';
import {
  prepareDataForOrganizations,
  prepareDataForRepositories,
} from '../utils/repository-utils';

export const useRepositories = (
  options: DataFetcherQueryParams,
): {
  loading: boolean;
  data: {
    repositories?: { [id: string]: AddRepositoryData };
    organizations?: { [id: string]: AddRepositoryData };
    totalRepositories?: number;
    totalOrganizations?: number;
  } | null;
  error: RepositoriesError | undefined;
} => {
  const identityApi = useApi(identityApiRef);
  const configApi = useApi(configApiRef);
  const bulkImportApi = useApi(bulkImportApiRef);

  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });

  const { value: baseUrl } = useAsync(async () => {
    const url = configApi.getString('app.baseUrl');
    return url;
  });

  const fetchRepositories = async (
    pageNo: number,
    size: number,
    showOrganizations: boolean,
    orgName: string,
    searchStr: string = '',
  ) => {
    if (showOrganizations) {
      return await bulkImportApi.dataFetcher(pageNo, size, searchStr, {
        fetchOrganizations: true,
      });
    }
    if (orgName) {
      return await bulkImportApi.dataFetcher(pageNo, size, searchStr, {
        orgName,
      });
    }
    return await bulkImportApi.dataFetcher(pageNo, size, searchStr);
  };

  const {
    data: value,
    error,
    isLoading: isQueryLoading,
  } = useQuery(
    [
      options?.showOrganizations ? 'organizations' : 'repositories',
      options?.page,
      options?.querySize,
      options?.showOrganizations,
      options?.orgName,
      options?.searchString,
    ],
    () =>
      fetchRepositories(
        options?.page,
        options?.querySize,
        options?.showOrganizations || false,
        options?.orgName || '',
        options?.searchString,
      ),
  );

  const prepareData = React.useMemo(() => {
    if (options?.showOrganizations) {
      return prepareDataForOrganizations(value as OrgAndRepoResponse);
    }
    return prepareDataForRepositories(
      value as OrgAndRepoResponse,
      user || 'user:default/guest',
      baseUrl || '',
    );
  }, [options?.showOrganizations, value, user, baseUrl]);

  return {
    loading: isQueryLoading,
    data: prepareData,
    error: {
      ...(error ?? {}),
      ...((value?.errors && value.errors.length > 0) ||
      (value as any as Response)?.statusText
        ? { errors: value?.errors || (value as any as Response)?.statusText }
        : {}),
    } as RepositoriesError,
  };
};
