import React from 'react';

import { Link } from '@backstage/core-components';

import ReadyIcon from '@mui/icons-material/CheckOutlined';
import { get } from 'lodash';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  Order,
} from '../types';

export const getRepositoryStatus = (
  status: string,
  isItemSelected?: boolean,
  isDrawer: boolean = false,
  selectedRepositories?: number,
) => {
  if (isItemSelected && !isDrawer) {
    return (
      <span>
        {selectedRepositories || ''}
        <ReadyIcon
          color="success"
          style={{ verticalAlign: 'sub', paddingTop: '7px' }}
        />
        Ready
      </span>
    );
  }
  if (status === 'Exists') {
    return <span style={{ color: 'grey' }}>Repository already added</span>;
  }

  return !isDrawer ? <span>Not generated</span> : null;
};

export const getRepositoryStatusForOrg = (
  data: AddRepositoriesData,
  alreadyAdded: number,
) => {
  const isSelected = data.selectedRepositories && data.selectedRepositories > 0;
  const allSelected =
    (data.selectedRepositories || 0) + alreadyAdded ===
    data.repositories?.length;

  if (!isSelected) {
    return <span>Not generated</span>;
  }

  if (allSelected) {
    return getRepositoryStatus('Exists', true);
  }

  return getRepositoryStatus('Exists', true);
};

const descendingComparator = (
  a: AddRepositoriesData,
  b: AddRepositoriesData,
  orderBy: string,
) => {
  const value1 = get(a, orderBy);
  const value2 = get(b, orderBy);

  if (value2 < value1) {
    return -1;
  }
  if (value2 > value1) {
    return 1;
  }
  return 0;
};

export const getComparator = (
  order: Order,
  orderBy: string,
): ((a: AddRepositoriesData, b: AddRepositoriesData) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export const createData = (
  id: number,
  name: string,
  url: string,
  catalogInfoYaml: string,
  organization?: string,
  selectedRepositories?: number,
): AddRepositoriesData => {
  return {
    id,
    name,
    url,
    organization,
    selectedRepositories,
    catalogInfoYaml: {
      status: catalogInfoYaml,
      yaml: '',
    },
  };
};

export const createOrganizationData = (
  id: number,
  name: string,
  url: string,
  repositories: AddRepositoriesData[],
): AddRepositoriesData => {
  return {
    id,
    name,
    url,
    repositories,
    selectedRepositories: 0,
  };
};

export const getSelectedRepositories = (
  onOrgRowSelected: (org: AddRepositoriesData) => void,
  organizationData: AddRepositoriesData,
  alreadyAdded: number,
) => {
  if (!organizationData || organizationData.selectedRepositories === 0) {
    return (
      <>
        None{' '}
        <Link to="" onClick={() => onOrgRowSelected(organizationData)}>
          Select
        </Link>
      </>
    );
  }
  return (
    <>
      {organizationData.selectedRepositories} /{' '}
      {(organizationData.repositories?.length || 0) - alreadyAdded}{' '}
      <Link onClick={() => onOrgRowSelected(organizationData)} to="">
        Edit
      </Link>
    </>
  );
};

export const getNewSelectedRepositories = (
  data: AddRepositoriesData[],
  selectedIds: number[],
) => {
  return selectedIds.length === 0
    ? []
    : data
        .map(d => {
          if (selectedIds.find((id: number) => id === d.id)) {
            return d;
          }
          return null;
        })
        .filter(repo => repo);
};

export const getRepositoriesSelected = (data: AddRepositoriesFormValues) => {
  return data.repositories?.length || 0;
};

export const filterSelectedForActiveDrawer = (
  repositories: AddRepositoriesData[],
  selectedReposID: number[],
) => {
  return selectedReposID
    .filter(id => id > -1)
    .filter(id => repositories?.map(r => r.id).includes(id));
};

export const urlHelper = (url: string) => {
  return url.split('https://')[1] || url;
};
