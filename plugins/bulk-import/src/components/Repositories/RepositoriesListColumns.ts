import { TableColumn } from '@backstage/core-components';

import { AddRepositoryData } from '../../types';

export const RepositoriesListColumns: TableColumn<AddRepositoryData>[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'repoName',
    type: 'string',
  },
  {
    id: 'repo-url',
    title: 'Repo URL',
    field: 'repoUrl',
    type: 'string',
  },
  {
    id: 'organization',
    title: 'Organization',
    field: 'organizationUrl',
    type: 'string',
  },
  {
    id: 'status',
    title: 'Status',
    field: 'catalogInfoYaml.status',
    type: 'string',
  },
  {
    id: 'last-updated',
    title: 'Last updated',
    field: 'catalogInfoYaml.lastUpdated',
    type: 'datetime',
  },
  {
    id: 'actions',
    title: 'Actions',
    field: 'actions',
    sorting: false,
    type: 'string',
  },
];
