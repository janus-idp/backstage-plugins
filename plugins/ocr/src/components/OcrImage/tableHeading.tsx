import { TableColumn } from '@backstage/core-components';

export const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
  },
  {
    title: 'Manifest',
    field: 'manifest_digest',
    type: 'string',
  },
];
