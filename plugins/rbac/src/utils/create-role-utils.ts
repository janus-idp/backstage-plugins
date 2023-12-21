import * as yup from 'yup';

import {
  PermissionPolicy,
  Policy,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  PermissionPolicies,
  PluginsPermissionPoliciesData,
  PluginsPermissions,
  RoleFormValues,
  SelectedMember,
} from '../components/CreateRole/types';
import { MemberEntity } from '../types';

const uniqBy = (arr: string[], iteratee: (arg: string) => any) => {
  return arr.filter(
    (x, i, self) => i === self.findIndex(y => iteratee(x) === iteratee(y)),
  );
};

export const getRoleData = (values: RoleFormValues): Role => {
  return {
    memberReferences: values.selectedMembers.map(
      (mem: SelectedMember) => mem.ref,
    ),
    name: `${values.kind}:${values.namespace}/${values.name}`,
  };
};

export const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  selectedMembers: yup.array().min(1, 'No member selected'),
  permissionPoliciesRows: yup.array().of(
    yup.object().shape({
      plugin: yup.string().required('Plugin is required'),
      permission: yup.string().required('Permission is required'),
    }),
  ),
});

export const getMembersCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'hasMember') {
          temp++;
        }
        return temp;
      }, 0) || 1
    : undefined;
};

export const getParentGroupsCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'childOf') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};

export const getChildGroupsCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'parentOf') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};

export const getPermissionPolicies = (
  policies: Policy[],
): PermissionPolicies => {
  return policies.reduce((ppsAcc: PermissionPolicies, policy) => {
    return {
      ...ppsAcc,
      [policy.permission as string]: uniqBy(
        policies.reduce((policiesAcc: any, pol) => {
          if (pol.permission === policy.permission)
            return [...policiesAcc, pol.policy];
          return policiesAcc;
        }, []),
        val => val,
      ),
    };
  }, {});
};

export const getPluginsPermissionPoliciesData = (
  pluginsPermissionPolicies: PermissionPolicy[],
): PluginsPermissionPoliciesData => {
  const plugins = pluginsPermissionPolicies.map(
    pluginPp => pluginPp.pluginId,
  ) as string[];
  const pluginsPermissions = pluginsPermissionPolicies.reduce(
    (acc: PluginsPermissions, pp, index) => {
      const permissions = pp.policies?.reduce((plcAcc: string[], plc) => {
        if (plc.permission) return [...plcAcc, plc.permission];
        return plcAcc;
      }, []);
      return {
        ...acc,
        [plugins[index]]: {
          permissions: uniqBy(permissions ?? [], val => val),
          policies: {
            ...(pp.policies ? getPermissionPolicies(pp.policies) : {}),
          },
        },
      };
    },
    {},
  );
  return { plugins, pluginsPermissions };
};

export const getPermissionPoliciesData = (
  values: RoleFormValues,
): RoleBasedPolicy[] => {
  const { name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedPolicy[], permissionPolicyRow) => {
      const { permission, policies } = permissionPolicyRow;
      const permissionPoliciesData = policies.reduce(
        (pAcc: RoleBasedPolicy[], policy) => {
          if (policy.checked) {
            return [
              ...pAcc,
              {
                entityReference: `role:${namespace}/${name}`,
                permission: `${permission}`,
                policy: policy.label.toLowerCase(),
                effect: 'allow',
              },
            ];
          }
          return pAcc;
        },
        [],
      );
      return [...acc, ...permissionPoliciesData];
    },
    [],
  );
};

export const getPermissionsNumber = (values: RoleFormValues) => {
  return getPermissionPoliciesData(values).length;
};
