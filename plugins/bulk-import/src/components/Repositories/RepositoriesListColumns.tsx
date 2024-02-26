import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import { RepositoriesData } from '../../types';

export const columns: TableColumn<RepositoriesData>[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
  },
  {
    title: 'Repo URL',
    field: 'repoURL',
    type: 'string',
    align: 'left',
    render: (props: RepositoriesData) => {
      return <Link to={props.repoURL}>{props.repoURL}</Link>;
    },
  },
  {
    title: 'Organization',
    field: 'organization',
    type: 'string',
    align: 'left',
    render: (props: RepositoriesData) => {
      return <Link to={props.organization}>{props.organization}</Link>;
    },
  },
  {
    title: 'Status',
    field: 'status',
    type: 'string',
    align: 'left',
  },
  {
    title: 'Last updated',
    field: 'lastUpdated',
    type: 'string',
    align: 'left',
  },
];
