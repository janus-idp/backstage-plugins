import { RowPolicy } from './types';

export const selectedPermissionPoliciesColumn = () => [
  {
    title: 'Plugin',
    field: 'plugin',
  },
  {
    title: 'Permission',
    field: 'permission',
  },
  {
    title: 'Policies',
    field: 'policies',
    render: (policies: RowPolicy[]) => {
      const policyStr = policies.reduce((acc: string, p) => {
        if (p.effect === 'allow') return acc.concat(`${p.policy}, `);
        return acc;
      }, '');
      return policyStr.slice(0, policyStr.length - 2);
    },
  },
];
