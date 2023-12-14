import { TableColumn } from '@backstage/core-components';

import { PermissionsData } from '../../types';

export const columns: TableColumn<PermissionsData>[] = [
  {
    title: 'Plugin',
    field: 'plugin',
    type: 'string',
  },
  {
    title: 'Permission',
    field: 'permission',
    type: 'string',
  },
  {
    title: 'Policies',
    field: 'policyString',
    type: 'string',
    customSort: (a, b) => {
      if (a.policies.size === 0) {
        return -1;
      }
      if (b.policies.size === 0) {
        return 1;
      }
      if (a.policies.size === b.policies.size) {
        return 0;
      }
      return a.policies.size < b.policies.size ? -1 : 1;
    },
  },
];
