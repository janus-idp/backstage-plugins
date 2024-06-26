import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import { AddRepositoriesData } from '../../types';
import { urlHelper } from '../../utils/repository-utils';
import DeleteRepository from './DeleteRepository';
import EditCatalogInfo from './EditCatalogInfo';
import SyncRepository from './SyncRepository';

export const columns: TableColumn<AddRepositoriesData>[] = [
  {
    title: 'Name',
    field: 'repoName',
    type: 'string',
  },
  {
    title: 'Repo URL',
    field: 'repoUrl',
    type: 'string',
    align: 'left',
    render: (props: AddRepositoriesData) => {
      return (
        <Link to={props.repoUrl || ''}>{urlHelper(props.repoUrl || '')}</Link>
      );
    },
  },
  {
    title: 'Organization',
    field: 'organization',
    type: 'string',
    align: 'left',
    render: (props: AddRepositoriesData) => {
      return (
        <Link to={props.organizationUrl || ''}>{props.organizationUrl}</Link>
      );
    },
  },
  {
    title: 'Status',
    field: 'catalogInfoYaml.status',
    type: 'string',
    align: 'left',
  },
  {
    title: 'Last updated',
    field: 'lastUpdated',
    type: 'string',
    align: 'left',
  },
  {
    title: 'Actions',
    field: 'actions',
    type: 'string',
    align: 'left',
    render: (data: AddRepositoriesData) => (
      <>
        <EditCatalogInfo data={data} />
        <DeleteRepository data={data} />
        <SyncRepository data={data} />
      </>
    ),
  },
];
