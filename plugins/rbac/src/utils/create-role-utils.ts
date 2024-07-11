import * as yup from 'yup';

import {
  isResourcedPolicy,
  PluginPermissionMetaData,
  PolicyDetails,
  ResourcedPolicy,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';
import { getTitleCase } from '@janus-idp/shared-react';

import { criterias } from '../components/ConditionalAccess/const';
import { ConditionsData } from '../components/ConditionalAccess/types';
import {
  PermissionPolicies,
  PluginsPermissionPoliciesData,
  PluginsPermissions,
  RoleFormValues,
  SelectedMember,
} from '../components/CreateRole/types';
import { MemberEntity, PermissionsData, RoleBasedConditions } from '../types';

export const uniqBy = (arr: string[], iteratee: (arg: string) => any) => {
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
    metadata: {
      description: values.description,
    },
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
      }, 0)
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
  policies: PolicyDetails[],
): PermissionPolicies => {
  return policies.reduce(
    (ppsAcc: PermissionPolicies, policy: PolicyDetails) => {
      const permission = isResourcedPolicy(policy)
        ? (policy as ResourcedPolicy).resourceType
        : policy.name;
      return {
        ...ppsAcc,
        [permission]: policies.reduce(
          (policiesAcc: { policies: string[]; isResourced: boolean }, pol) => {
            const perm = isResourcedPolicy(pol)
              ? (pol as ResourcedPolicy).resourceType
              : pol.name;
            if (permission === perm)
              return {
                policies: uniqBy(
                  [...policiesAcc.policies, getTitleCase(pol.policy as string)],
                  val => val,
                ),
                isResourced: isResourcedPolicy(pol),
              };
            return policiesAcc;
          },
          { policies: [], isResourced: false },
        ),
      };
    },
    {},
  );
};

export const getPluginsPermissionPoliciesData = (
  pluginsPermissionPolicies: PluginPermissionMetaData[],
): PluginsPermissionPoliciesData => {
  const plugins: string[] = pluginsPermissionPolicies.map(
    pluginPp => pluginPp.pluginId,
  );
  const pluginsPermissions = pluginsPermissionPolicies.reduce(
    (acc: PluginsPermissions, pp, index) => {
      const permissions = pp.policies.reduce((plcAcc: string[], plc) => {
        const permission = isResourcedPolicy(plc)
          ? (plc as ResourcedPolicy).resourceType
          : plc.name;
        return [...plcAcc, permission];
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
  const { kind, name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedPolicy[], permissionPolicyRow) => {
      const { permission, policies, conditions } = permissionPolicyRow;
      const permissionPoliciesData = policies.reduce(
        (pAcc: RoleBasedPolicy[], policy) => {
          if (policy.effect === 'allow' && !conditions) {
            return [
              ...pAcc,
              {
                entityReference: `${kind}:${namespace}/${name}`,
                permission: `${permission}`,
                policy: policy.policy.toLowerCase(),
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

export const getConditionalPermissionPoliciesData = (
  values: RoleFormValues,
) => {
  const { kind, name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedConditions[], permissionPolicyRow: PermissionsData) => {
      const { permission, policies, isResourced, plugin, conditions } =
        permissionPolicyRow;
      const permissionMapping = policies.reduce((pAcc: string[], policy) => {
        if (policy.effect === 'allow') {
          return [...pAcc, policy.policy.toLowerCase()];
        }
        return pAcc;
      }, []);
      return isResourced && conditions
        ? [
            ...acc,
            {
              result: 'CONDITIONAL',
              roleEntityRef: `${kind}:${namespace}/${name}`,
              pluginId: `${plugin}`,
              resourceType: `${permission}`,
              permissionMapping,
              conditions:
                Object.keys(conditions)[0] === criterias.condition
                  ? { ...conditions.condition }
                  : conditions,
            } as RoleBasedConditions,
          ]
        : acc;
    },
    [] as RoleBasedConditions[],
  );
};

export const getUpdatedConditionalPolicies = (
  values: RoleFormValues,
  initialValues: RoleFormValues,
) => {
  const initialConditionsWithId = initialValues.permissionPoliciesRows.filter(
    ppr => ppr.id,
  );

  const conditionsWithId = values.permissionPoliciesRows.filter(ppr => ppr.id);

  return conditionsWithId.length > 0
    ? conditionsWithId.reduce(
        (
          acc: { id: number; updateCondition: RoleBasedConditions }[],
          condition: PermissionsData,
        ) => {
          const conditionExists = initialConditionsWithId.find(
            c => c.id === condition.id,
          );

          if (conditionExists && condition.id)
            return [
              ...acc,
              {
                id: condition.id,
                updateCondition: getConditionalPermissionPoliciesData({
                  ...values,
                  permissionPoliciesRows: [condition],
                })[0],
              },
            ];
          return acc;
        },
        [],
      )
    : [];
};

export const getNewConditionalPolicies = (values: RoleFormValues) => {
  const newValues = { ...values };
  const newPermissionPolicies = values.permissionPoliciesRows.filter(
    ppr => !ppr.id,
  );
  newValues.permissionPoliciesRows = newPermissionPolicies;
  return getConditionalPermissionPoliciesData(newValues);
};

export const getRemovedConditionalPoliciesIds = (
  values: RoleFormValues,
  initialValues: RoleFormValues,
) => {
  const initialConditionsIds = initialValues.permissionPoliciesRows
    .map(ppr => ppr.id)
    .filter(id => id);

  const newConditionsIds = values.permissionPoliciesRows
    .map(ppr => ppr.id)
    .filter(id => id);

  return initialConditionsIds.length > 0
    ? initialConditionsIds.reduce((acc: number[], oldId) => {
        const conditionExists = newConditionsIds.includes(oldId);
        if (conditionExists) return acc;
        return oldId ? [...acc, oldId] : acc;
      }, [])
    : [];
};

export const getPermissionsNumber = (values: RoleFormValues) => {
  return getPermissionPoliciesData(values).length;
};

export const getConditionsNumber = (values: RoleFormValues) => {
  return getConditionalPermissionPoliciesData(values)?.length ?? 0;
};

export const getRulesNumber = (conditions?: ConditionsData) => {
  if (!conditions) return 0;

  if (conditions.allOf) return conditions.allOf.length;

  if (conditions.anyOf) return conditions.anyOf.length;

  return 1;
};
