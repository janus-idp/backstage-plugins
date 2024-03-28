import React from 'react';

import { Link } from '@backstage/core-components';

import ReadyIcon from '@mui/icons-material/CheckOutlined';
import FailedIcon from '@mui/icons-material/CloseOutlined';
import GeneratingIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { get } from 'lodash';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  Order,
} from '../types';

export const getRepositoryStatus = (status: string) => {
  switch (status) {
    case 'Progress':
      return (
        <span>
          <GeneratingIcon
            color="action"
            style={{ verticalAlign: 'bottom', paddingTop: '7px' }}
          />
          Generating...
        </span>
      );
    case 'Failed':
      return (
        <span>
          <FailedIcon
            color="error"
            style={{ verticalAlign: 'bottom', paddingTop: '7px' }}
          />
          Failed generating file <Link to="">Try again</Link>
        </span>
      );

    case 'Done':
      return (
        <span>
          <ReadyIcon
            color="success"
            style={{ verticalAlign: 'bottom', paddingTop: '7px' }}
          />
          Ready
        </span>
      );
    case 'Exists':
      return <span style={{ color: 'grey' }}>Repository already added</span>;
    default:
      return <span>Not generated</span>;
  }
};

export const getRepositoryStatusForOrg = (data: AddRepositoriesData) => {
  if (data.selectedRepositories && data.selectedRepositories > 0) {
    return getRepositoryStatus(data.catalogInfoYaml.status);
  }

  return <span>Not generated</span>;
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

export const getSelectedRepositories = (repositories: number | undefined) => {
  if (!repositories || repositories === 0) {
    return (
      <>
        None{' '}
        <Link onClick={() => {}} to="">
          Select
        </Link>
      </>
    );
  }
  return (
    <>
      {repositories}{' '}
      <Link onClick={() => {}} to="">
        Edit
      </Link>
    </>
  );
};

export const getNewSelectedRepositories = (
  data: AddRepositoriesData[],
  selectedIds: number[],
) => {
  return data
    .map(d => {
      if (selectedIds.find((id: number) => id === d.id)) {
        return d;
      }
      return null;
    })
    .filter(repo => repo);
};

export const getRepositoriesSelected = (data: AddRepositoriesFormValues) => {
  if (data.repositoryType === 'repository') {
    return data.repositories?.length || 0;
  }
  return (
    data.organizations?.reduce((acc, org) => {
      const repos = acc + (org.selectedRepositories as number) || 0;
      return repos;
    }, 0) || 0
  );
};
