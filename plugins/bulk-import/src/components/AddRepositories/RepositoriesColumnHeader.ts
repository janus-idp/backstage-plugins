import { TableColumn } from '@backstage/core-components';

export const RepositoriesColumnHeader: TableColumn[] = [
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
    id: 'organization',
    title: 'Organization',
    field: 'organizationUrl',
  },
  {
    id: 'cataloginfoyaml',
    title: 'catalog-info.yaml',
    field: 'catalogInfoYaml.status',
  },
];
