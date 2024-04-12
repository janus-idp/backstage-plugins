import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { BulkImportPage, bulkImportPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(bulkImportPlugin)
  .addPage({
    element: <BulkImportPage />,
    title: 'Bulk import',
    path: '/bulk-import/repositories',
  })
  .render();
