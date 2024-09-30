import { TableColumn } from '@backstage/core-components';

export const OrganizationsColumnHeader: TableColumn[] = [
  {
    id: 'name',
    title: 'Name',
    field: 'orgName',
  },
  { id: 'url', title: 'URL', field: 'organizationUrl' },
  {
    id: 'selected-repositories',
    title: 'Selected repositories',
    field: 'selectedRepositories',
  },
  {
    id: 'cataloginfoyaml',
    title: 'catalog-info.yaml',
    field: 'catalogInfoYaml.status',
  },
];
