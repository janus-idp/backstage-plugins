import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { RequirePermission } from '@backstage/plugin-permission-react';

import { policyEntityCreatePermission } from '@janus-idp/backstage-plugin-rbac-common';

import { createRoleRouteRef, roleRouteRef } from '../routes';
import { CreateRolePage } from './CreateRole/CreateRolePage';
import { RbacPage } from './RbacPage';
import { RoleOverviewPage } from './RoleOverviewPage';

/**
 *
 * @public
 */
export const Router = () => (
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
  </Routes>
);
