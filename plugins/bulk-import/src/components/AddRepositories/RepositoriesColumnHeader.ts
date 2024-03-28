import { TableColumn } from '@backstage/core-components';

export const RepositoriesColumnHeader: TableColumn[] = [
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
    id: 'organization',
    title: 'Organization',
    field: 'organization',
  },
  {
    id: 'catalogInfoYaml',
    title: 'catalog-info.yaml',
    field: 'catalogInfoYaml',
  },
];
