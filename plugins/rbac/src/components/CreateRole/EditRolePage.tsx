import React from 'react';
import { useParams } from 'react-router-dom';

import {
  Content,
  ErrorPage,
  Header,
  Page,
  Progress,
  useQueryParamState,
} from '@backstage/core-components';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { useSelectedMembers } from '../../hooks/useSelectedMembers';
import { RoleForm } from './RoleForm';
import { RoleFormValues } from './types';

export const EditRolePage = () => {
  const { roleName, roleNamespace, roleKind } = useParams();
  const [queryParamState] = useQueryParamState<number>('activeStep');
  const {
    selectedMembers,
    members,
    role,
    loading: loadingMembers,
    roleError,
    membersError,
    canReadUsersAndGroups,
  } = useSelectedMembers(
    roleName ? `${roleKind}:${roleNamespace}/${roleName}` : '',
  );

  const { data, loading: loadingPolicies } = usePermissionPolicies(
    `${roleKind}:${roleNamespace}/${roleName}`,
  );

  const initialValues: RoleFormValues = {
    name: roleName || '',
    namespace: roleNamespace || 'default',
    kind: roleKind || 'role',
    description: role?.metadata?.description ?? '',
    selectedMembers,
    permissionPoliciesRows: data,
  };

  if (loadingMembers || loadingPolicies) {
    return <Progress />;
  }
  if (roleError.name) {
    return (
      <ErrorPage status={roleError.name} statusMessage={roleError.message} />
    );
  }
  if (!canReadUsersAndGroups) {
    return <ErrorPage statusMessage="Unauthorized to edit role" />;
  }

  return (
    <Page themeId="tool">
      <Header title="Edit role" type="RBAC" typeLink=".." />
      <Content>
        <RoleForm
          initialValues={initialValues}
          titles={{
            formTitle: 'Edit Role',
            nameAndDescriptionTitle: 'Edit name and description of role ',
            usersAndGroupsTitle: 'Edit users and groups',
            permissionPoliciesTitle: 'Edit permission policies',
          }}
          roleName={roleName ? `${roleKind}:${roleNamespace}/${roleName}` : ''}
          step={Number(queryParamState)}
          membersData={{
            members,
            loading: loadingMembers,
            error: membersError,
          }}
          submitLabel="Save"
        />
      </Content>
    </Page>
  );
};
