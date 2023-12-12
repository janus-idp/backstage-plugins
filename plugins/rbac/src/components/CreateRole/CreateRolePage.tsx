import React from 'react';

import { Content, Header, Page } from '@backstage/core-components';
import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { CreateRoleForm } from './CreateRoleForm';

export const CreateRolePage = () => {
  return (
    <RequirePermission
      permission={catalogEntityReadPermission}
      resourceRef={catalogEntityReadPermission.resourceType}
    >
      <Page themeId="tool">
        <Header title="Create role" />
        <Content>
          <CreateRoleForm />
        </Content>
      </Page>
    </RequirePermission>
  );
};
