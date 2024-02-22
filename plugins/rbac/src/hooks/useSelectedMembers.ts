import { useAsync } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { Role } from '@janus-idp/backstage-plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { SelectedMember } from '../components/CreateRole/types';
import { MemberEntity } from '../types';
import { getSelectedMember } from '../utils/rbac-utils';
import { useRole } from './useRole';

export const useSelectedMembers = (
  roleName: string,
): {
  members: MemberEntity[];
  selectedMembers: SelectedMember[];
  role: Role | undefined;
  membersError: Error;
  roleError: Error;
  loading: boolean;
} => {
  const rbacApi = useApi(rbacApiRef);
  const { role, loading: roleLoading, roleError } = useRole(roleName);

  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const data: SelectedMember[] = role
    ? (role as Role).memberReferences.reduce((acc: SelectedMember[], ref) => {
        const memberResource =
          (Array.isArray(members) &&
            members.find(member => stringifyEntityRef(member) === ref)) ||
          undefined;
        acc.push(getSelectedMember(memberResource, ref));

        return acc;
      }, [])
    : [];

  return {
    selectedMembers: data,
    members: Array.isArray(members) ? members : ([] as MemberEntity[]),
    role,
    membersError: (membersError as Error) || {
      name: (members as Response)?.status,
      message: (members as Response)?.statusText,
    },
    roleError: roleError,
    loading: roleLoading && membersLoading,
  };
};
