import { useAsync } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { Role } from '@janus-idp/backstage-plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { SelectedMember } from '../components/CreateRole/types';
import { MemberEntity } from '../types';
import { getSelectedMember } from '../utils/rbac-utils';

export const useSelectedMembers = (
  roleName: string,
): {
  members: MemberEntity[];
  selectedMembers: SelectedMember[];
  membersError: Error;
  roleError?: Error;
  loading: boolean;
} => {
  const rbacApi = useApi(rbacApiRef);
  let data: SelectedMember[] = [];
  const {
    value: role,
    loading: roleLoading,
    error: roleError,
  } = useAsync(async () => {
    return await rbacApi.getRole(roleName);
  });

  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const membersArr = Array.isArray(members) ? members : ([] as MemberEntity[]);
  const membersErr = (membersError as Error) || {
    name: (members as Response)?.status,
    message: (members as Response)?.statusText,
  };

  data = Array.isArray(role)
    ? (role[0] as Role).memberReferences.reduce(
        (acc: SelectedMember[], ref) => {
          const memberResource =
            (Array.isArray(members) &&
              members.find(member => stringifyEntityRef(member) === ref)) ||
            undefined;
          acc.push(getSelectedMember(memberResource, ref));

          return acc;
        },
        [],
      )
    : [];

  return {
    selectedMembers: data,
    members: membersArr,
    membersError: membersErr,
    roleError: (roleError as Error) || {
      name: (role as Response)?.status,
      message: `Error fetching the role. ${(role as Response)?.statusText}`,
    },
    loading: roleLoading && membersLoading,
  };
};
