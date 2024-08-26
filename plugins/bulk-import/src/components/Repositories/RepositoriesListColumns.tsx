import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { AddRepositoryData } from '../../types';
import {
  descendingComparator,
  getImportStatus,
  urlHelper,
} from '../../utils/repository-utils';
import DeleteRepository from './DeleteRepository';
import EditCatalogInfo from './EditCatalogInfo';
import SyncRepository from './SyncRepository';

export const columns: TableColumn<AddRepositoryData>[] = [
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
    render: (props: AddRepositoryData) => {
      return (
        <Link to={props.repoUrl || ''}>
          {urlHelper(props.repoUrl || '')}
          <OpenInNewIcon style={{ verticalAlign: 'sub', paddingTop: '7px' }} />
        </Link>
      );
    },
  },
  {
    title: 'Organization',
    field: 'organizationUrl',
    type: 'string',
    align: 'left',
    render: (props: AddRepositoryData) => {
      return (
        <Link to={props.organizationUrl || ''}>
          {props.organizationUrl}
          <OpenInNewIcon style={{ verticalAlign: 'sub', paddingTop: '7px' }} />
        </Link>
      );
    },
  },
  {
    title: 'Status',
    field: 'catalogInfoYaml.status',
    type: 'string',
    align: 'left',
    customSort: (a: AddRepositoryData, b: AddRepositoryData) =>
      descendingComparator(a, b, 'catalogInfoYaml.status'),
    render: (data: AddRepositoryData) =>
      getImportStatus(data.catalogInfoYaml?.status as string),
  },
  {
    title: 'Last updated',
    field: 'catalogInfoYaml.lastUpdated',
    type: 'string',
    align: 'left',
  },
  {
    title: 'Actions',
    field: 'actions',
    sorting: false,
    type: 'string',
    align: 'left',
    render: (data: AddRepositoryData) => (
      <>
        <EditCatalogInfo data={data} />
        <DeleteRepository data={data} />
        <SyncRepository data={data} />
      </>
    ),
  },
];
