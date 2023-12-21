import React from 'react';

import { Header, Page, TabbedLayout } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { policyEntityReadPermission } from '@janus-idp/backstage-plugin-rbac-common';

import { DeleteDialogContextProvider } from './RolesList/DeleteDialogContext';
import { RolesList } from './RolesList/RolesList';

export const RbacPage = () => (
  <RequirePermission
    permission={policyEntityReadPermission}
    resourceRef={policyEntityReadPermission.resourceType}
  >
    <Page themeId="tool">
      <Header title="Administration" />
      <DeleteDialogContextProvider>
        <TabbedLayout>
          <TabbedLayout.Route path="/rbac" title="RBAC">
            <RolesList />
          </TabbedLayout.Route>
        </TabbedLayout>
      </DeleteDialogContextProvider>
    </Page>
  </RequirePermission>
);
