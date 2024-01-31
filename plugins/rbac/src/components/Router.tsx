import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { RequirePermission } from '@backstage/plugin-permission-react';

import {
  policyEntityCreatePermission,
  policyEntityUpdatePermission,
} from '@janus-idp/backstage-plugin-rbac-common';

import { createRoleRouteRef, editRoleRouteRef, roleRouteRef } from '../routes';
import { CreateRolePage } from './CreateRole/CreateRolePage';
import { EditRolePage } from './CreateRole/EditRolePage';
import { RbacPage } from './RbacPage';
import { RoleOverviewPage } from './RoleOverview/RoleOverviewPage';
import { ToastContextProvider } from './ToastContext';

/**
 *
 * @public
 */
export const Router = () => (
  <ToastContextProvider>
    <Routes>
      <Route path="/" element={<RbacPage />} />
      <Route path={roleRouteRef.path} element={<RoleOverviewPage />} />
      <Route
        path={createRoleRouteRef.path}
        element={
          <RequirePermission
            permission={policyEntityCreatePermission}
            resourceRef={policyEntityCreatePermission.resourceType}
          >
            <CreateRolePage />
          </RequirePermission>
        }
      />
      <Route
        path={editRoleRouteRef.path}
        element={
          <RequirePermission
            permission={policyEntityUpdatePermission}
            resourceRef={policyEntityUpdatePermission.resourceType}
          >
            <EditRolePage />
          </RequirePermission>
        }
      />
    </Routes>
  </ToastContextProvider>
);
