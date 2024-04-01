import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { icon } from '../src/components/BulkImportIcon';
import { mockEntities } from '../src/mocks/mockEntities';
import { BulkImportPage, bulkImportPlugin } from '../src/plugin';

const mockCatalogApi = {
  getEntities: async () => ({ items: mockEntities }),
};

createDevApp()
  .registerPlugin(bulkImportPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: (
      <TestApiProvider apis={[[catalogApiRef, mockCatalogApi]]}>
        <BulkImportPage />
      </TestApiProvider>
    ),
    title: 'Bulk import',
    path: '/bulk-import/repositories',
    icon,
  })
  .render();
