import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { BulkImportPage } from '../plugin';

/**
 *
 * @public
 */
export const Router = () => (
  <Routes>
    <Route path="/repositories" element={<BulkImportPage />} />
  </Routes>
);
