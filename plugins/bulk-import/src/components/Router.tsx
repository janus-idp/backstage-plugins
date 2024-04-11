import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { addRepositoriesRouteRef } from '../routes';
import { AddRepositoriesPage } from './AddRepositories/AddRepositoriesPage';
import { BulkImportPage } from './BulkImportPage';

/**
 *
 * @public
 */
export const Router = () => (
  <Routes>
    <Route path="*" element={<BulkImportPage />} />
    <Route
      path={addRepositoriesRouteRef.path}
      element={<AddRepositoriesPage />}
    />
  </Routes>
);
