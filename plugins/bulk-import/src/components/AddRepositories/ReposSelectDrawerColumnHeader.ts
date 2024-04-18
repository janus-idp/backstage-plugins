import { TableColumn } from '@backstage/core-components';

export const ReposSelectDrawerColumnHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'name',
  },
  {
    id: 'url',
    title: 'URL',
    field: 'url',
  },
  {
    id: 'catalogInfoYaml',
    title: '',
    field: 'catalogInfoYaml',
  },
];
