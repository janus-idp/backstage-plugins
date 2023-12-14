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
import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { useSelectedMembers } from '../../hooks/useSelectedMembers';
import { RoleForm } from './RoleForm';
import { RoleFormValues } from './types';

export const EditRolePage = () => {
  const { roleName, roleNamespace, roleKind } = useParams();
  const [queryParamState] = useQueryParamState<number>('activeStep');
  const { selectedMembers, members, loading, roleError, membersError } =
    useSelectedMembers(
      roleName ? `${roleKind}:${roleNamespace}/${roleName}` : '',
    );

  const initialValues: RoleFormValues = {
    name: roleName || '',
    namespace: roleNamespace || 'default',
    kind: roleKind || 'role',
    description: '',
    selectedMembers,
    permissionPoliciesRows: [
      {
        plugin: '',
        permission: '',
        policies: [
          { label: 'Create', checked: false },
          { label: 'Read', checked: false },
          { label: 'Update', checked: false },
          { label: 'Delete', checked: false },
        ],
      },
    ],
  };
  const renderPage = () => {
    if (loading) {
      return <Progress />;
    } else if (roleError?.name) {
      return (
        <ErrorPage status={roleError.name} statusMessage={roleError.message} />
      );
    }
    return (
      <>
        <Header title="Edit Role" />
        <Content>
          <RoleForm
            initialValues={initialValues}
            titles={{
              formTitle: 'Edit Role',
              nameAndDescriptionTitle: 'Edit name and description of role ',
              usersAndGroupsTitle: 'Edit users and groups',
              permissionPoliciesTitle: '',
            }}
            roleName={
              roleName ? `${roleKind}:${roleNamespace}/${roleName}` : ''
            }
            step={Number(queryParamState)}
            membersData={{ members, loading, error: membersError }}
            submitLabel="Save"
          />
        </Content>
      </>
    );
  };

  return (
    <RequirePermission
      permission={catalogEntityReadPermission}
      resourceRef={catalogEntityReadPermission.resourceType}
    >
      <Page themeId="tool">{renderPage()}</Page>
    </RequirePermission>
  );
};
