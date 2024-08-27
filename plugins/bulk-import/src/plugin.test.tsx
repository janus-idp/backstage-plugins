import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { renderInTestApp } from '@backstage/test-utils';

import { screen, waitFor } from '@testing-library/react';

import { BulkImportSidebarItem } from './components';
import { BulkImportPage, bulkImportPlugin } from './plugin';
import { rootRouteRef } from './routes';

describe('bulk-import', () => {
  it('should export plugin', () => {
    expect(bulkImportPlugin).toBeDefined();
  });
  it('should render the bulk import page', async () => {
    await renderInTestApp(
      <Routes>
        <Route path="*" element={<BulkImportPage />} />
      </Routes>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

    await waitFor(() => {
      expect(screen.queryByText('Bulk import')).toBeInTheDocument();
    });
  });

  it('should render the bulk import icon', async () => {
    await renderInTestApp(
      <Routes>
        <Route path="*" element={<BulkImportSidebarItem />} />
      </Routes>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('img', { name: 'bulk import icon' }),
      ).toBeInTheDocument();
    });
  });
});
