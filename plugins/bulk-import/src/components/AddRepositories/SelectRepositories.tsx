import * as React from 'react';

import { Link } from '@backstage/core-components';

import { AddRepositoryData } from '../../types';

export const SelectRepositories = ({
  onOrgRowSelected,
  orgData,
  addedRepositoriesCount,
}: {
  onOrgRowSelected: (org: AddRepositoryData) => void;
  orgData: AddRepositoryData;
  addedRepositoriesCount: number;
}) => {
  if (orgData?.totalReposInOrg === 0) {
    return (
      <span style={{ color: '#6A6E73' }} data-testid="no-repositories">
        No repositories found
      </span>
    );
  }

  if (orgData?.totalReposInOrg === addedRepositoriesCount) {
    return (
      <span style={{ color: '#6A6E73' }} data-testid="no-repositories">
        All repositories are added{' '}
        <Link to="" onClick={() => onOrgRowSelected(orgData)}>
          View
        </Link>
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
      {(orgData?.totalReposInOrg || 0) - addedRepositoriesCount}{' '}
      <Link onClick={() => onOrgRowSelected(orgData)} to="">
        Edit
      </Link>
    </span>
  );
};
