import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { roleRouteRef } from '../routes';
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
  </Routes>
);
