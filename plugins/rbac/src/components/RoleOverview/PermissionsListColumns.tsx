import { TableColumn } from '@backstage/core-components';

import { PermissionsData } from '../../types';
import { getRulesNumber } from '../../utils/create-role-utils';

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
      if (a.policies.length === 0) {
        return -1;
      }
      if (b.policies.length === 0) {
        return 1;
      }
      if (a.policies.length === b.policies.length) {
        return 0;
      }
      return a.policies.length < b.policies.length ? -1 : 1;
    },
  },
  {
    title: 'Conditional',
    field: 'conditions',
    type: 'string',
    render: (permissionsData: PermissionsData) => {
      const totalRules = getRulesNumber(permissionsData.conditions);
      return totalRules
        ? `${totalRules} ${totalRules > 1 ? 'rules' : 'rule'}`
        : '-';
    },
  },
];
