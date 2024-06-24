import { TableColumn } from '@backstage/core-components';

export const OrganizationColumnHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'orgName',
  },
  { id: 'url', title: 'URL', field: 'organizationUrl' },
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
