import React from 'react';
import { useAsync } from 'react-use';

import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { MemberEntity } from '../../types';
import { initialPermissionPolicyRowValue } from './const';
import { RoleForm } from './RoleForm';
import { RoleFormValues } from './types';

export const CreateRolePage = () => {
  const rbacApi = useApi(rbacApiRef);
  const {
    loading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const initialValues: RoleFormValues = {
    name: '',
    namespace: 'default',
    kind: 'role',
    description: '',
    selectedMembers: [],
    permissionPoliciesRows: [initialPermissionPolicyRowValue],
  };

  return (
    <RequirePermission
      permission={catalogEntityReadPermission}
      resourceRef={catalogEntityReadPermission.resourceType}
    >
      <Page themeId="tool">
        <Header title="Create role" type="RBAC" typeLink="/rbac" />
        <Content>
          <RoleForm
            initialValues={initialValues}
            titles={{
              formTitle: 'Create Role',
              nameAndDescriptionTitle: 'Enter name and description of role ',
              usersAndGroupsTitle: 'Add users and groups',
              permissionPoliciesTitle: '',
            }}
            membersData={{
              members: Array.isArray(members)
                ? members
                : ([] as MemberEntity[]),
              loading,
              error: (membersError as Error) || {
                name: (members as Response)?.status,
                message: (members as Response)?.statusText,
              },
            }}
          />
        </Content>
      </Page>
    </RequirePermission>
  );
};
