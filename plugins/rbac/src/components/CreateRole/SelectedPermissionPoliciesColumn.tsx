import { getRulesNumber } from '../../utils/create-role-utils';
import { ConditionsData } from '../ConditionalAccess/types';
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
  {
    title: 'Conditional',
    field: 'conditions',
    render: (conditions: ConditionsData) => {
      const totalRules = getRulesNumber(conditions);
      return totalRules
        ? `${totalRules} ${totalRules > 1 ? 'rules' : 'rule'}`
        : '-';
    },
  },
];
