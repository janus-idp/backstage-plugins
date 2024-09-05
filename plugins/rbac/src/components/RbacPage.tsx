import React from 'react';

import { Content, Header, Page } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { policyEntityReadPermission } from '@janus-idp/backstage-plugin-rbac-common';

import { DeleteDialogContextProvider } from './RolesList/DeleteDialogContext';
import { RolesList } from './RolesList/RolesList';

export const RbacPage = ({ useHeader = true }: { useHeader?: boolean }) => (
  <RequirePermission
    permission={policyEntityReadPermission}
    resourceRef={policyEntityReadPermission.resourceType}
  >
    <Page themeId="tool">
      {useHeader && <Header title="RBAC" />}
      <Content>
        <DeleteDialogContextProvider>
          <RolesList />
        </DeleteDialogContextProvider>
      </Content>
    </Page>
  </RequirePermission>
);
