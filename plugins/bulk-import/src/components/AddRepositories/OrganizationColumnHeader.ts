import { TableColumn } from '@backstage/core-components';

export const OrganizationColumnHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'name',
  },
  { id: 'url', title: 'URL', field: 'url' },
  {
    id: 'selectedRepositories',
    title: 'Selected repositories',
    field: 'selectedRepositories',
  },
  {
    id: 'catalogInfoYaml',
    title: 'catalog-info.yaml',
    field: 'catalogInfoYaml',
  },
];
