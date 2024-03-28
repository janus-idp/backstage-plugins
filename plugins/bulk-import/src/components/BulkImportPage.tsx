import React from 'react';

import { Header, Page, TabbedLayout } from '@backstage/core-components';

import { RepositoriesList } from './Repositories/RepositoriesList';

export const BulkImportPage = () => (
  <Page themeId="tool">
    <Header title="Bulk import" />
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Repositories">
        <RepositoriesList />
      </TabbedLayout.Route>
    </TabbedLayout>
  </Page>
);
