import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { BulkImportPage, bulkImportPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(bulkImportPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: <BulkImportPage />,
    title: 'Bulk import',
    path: '/bulk-import/repositories',
  })
  .render();
