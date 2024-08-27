import { TableColumn } from '@backstage/core-components';

export const ReposSelectDrawerColumnHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'repoName',
  },
  {
    id: 'url',
    title: 'URL',
    field: 'repoUrl',
  },
  {
    id: 'catalogInfoYaml',
    title: '',
    field: 'catalogInfoYaml.status',
  },
];
