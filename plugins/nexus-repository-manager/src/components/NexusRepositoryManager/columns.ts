import { type TableColumn } from '@backstage/core-components';

export const COLUMNS: TableColumn[] = [
  {
    title: 'Version',
    field: 'version',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Repository',
    field: 'repository',
    type: 'string',
  },
  {
    title: 'Repository Type',
    field: 'repositoryType',
    type: 'string',
  },
  {
    title: 'Manifest',
    field: 'manifestDigest',
    type: 'string',
  },
  {
    title: 'Modified',
    field: 'lastModified',
    type: 'date',
  },
  {
    title: 'Size',
    field: 'size',
    type: 'string',
  },
];
