import * as React from 'react';
import { useAsync } from 'react-use';

import { Link, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { AddRepositoryData } from '../../types/types';

export const SelectRepositories = ({
  onOrgRowSelected,
  orgData,
  addedRepositoriesCount,
  setRepositoriesCount,
}: {
  onOrgRowSelected: (org: AddRepositoryData) => void;
  orgData: AddRepositoryData;
  addedRepositoriesCount: number;
  setRepositoriesCount: (count: number) => void;
}) => {
  // remove api querying when https://github.com/janus-idp/backstage-plugins/pull/1974 is merged
  const bulkImportApi = useApi(bulkImportApiRef);
  const { loading, value } = useAsync(
    async () =>
      await bulkImportApi.getRepositoriesFromOrg(orgData.orgName || '', 1, 1),
  );
  React.useEffect(() => {
    setRepositoriesCount(value?.totalCount || 0);
  }, [value?.totalCount, setRepositoriesCount]);

  if (loading) {
    return <Progress />;
  }

  if (!value?.totalCount || value?.totalCount === 0) {
    return (
      <span style={{ color: '#6A6E73' }} data-testid="no-repositories">
        No repositories found
      </span>
    );
  }

  if (
    !orgData ||
    Object.keys(orgData?.selectedRepositories || [])?.length === 0
  ) {
    return (
      <span data-testid="select-repositories">
        None{' '}
        <Link to="" onClick={() => onOrgRowSelected(orgData)}>
          Select
        </Link>
      </span>
    );
  }
  return (
    <span data-testid="edit-repositories">
      {Object.keys(orgData.selectedRepositories || [])?.length}/
      {value.totalCount - addedRepositoriesCount}{' '}
      <Link onClick={() => onOrgRowSelected(orgData)} to="">
        Edit
      </Link>
    </span>
  );
};
