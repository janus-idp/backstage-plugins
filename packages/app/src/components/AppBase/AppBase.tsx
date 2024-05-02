import React, { useContext } from 'react';
import { Navigate, Route } from 'react-router-dom';

import { FlatRoutes } from '@backstage/core-app-api';
import { AlertDisplay, OAuthRequestDialog } from '@backstage/core-components';
import { ApiExplorerPage } from '@backstage/plugin-api-docs';
import { CatalogEntityPage, CatalogIndexPage } from '@backstage/plugin-catalog';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { CatalogImportPage } from '@backstage/plugin-catalog-import';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { ScaffolderPage } from '@backstage/plugin-scaffolder';
import { SearchPage as BackstageSearchPage } from '@backstage/plugin-search';
import { UserSettingsPage } from '@backstage/plugin-user-settings';

import { entityPage } from '../catalog/EntityPage';
import DynamicRootContext from '../DynamicRoot/DynamicRootContext';
import { Root } from '../Root';
import { SearchPage } from '../search/SearchPage';

const AppBase = () => {
  const { AppProvider, AppRouter, dynamicRoutes, entityTabOverrides } =
    useContext(DynamicRootContext);
  return (
    <AppProvider>
      <AlertDisplay />
      <OAuthRequestDialog />
      <AppRouter>
        <Root>
          <FlatRoutes>
            {dynamicRoutes.filter(({ path }) => path === '/').length === 0 && (
              <Route path="/" element={<Navigate to="catalog" />} />
            )}
            <Route path="/catalog" element={<CatalogIndexPage pagination />} />
            <Route
              path="/catalog/:namespace/:kind/:name"
              element={<CatalogEntityPage />}
            >
              {entityPage(entityTabOverrides)}
            </Route>
            <Route
              path="/create"
              element={
                <ScaffolderPage
                  headerOptions={{ title: 'Software Templates' }}
                />
              }
            />
            <Route path="/api-docs" element={<ApiExplorerPage />} />
            <Route
              path="/catalog-import"
              element={
                <RequirePermission permission={catalogEntityCreatePermission}>
                  <CatalogImportPage />
                </RequirePermission>
              }
            />
            <Route path="/search" element={<BackstageSearchPage />}>
              <SearchPage />
            </Route>
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="/catalog-graph" element={<CatalogGraphPage />} />
            {dynamicRoutes.map(
              ({ Component, staticJSXContent, path, config: { props } }) => (
                <Route
                  key={path}
                  path={path}
                  element={<Component {...props} />}
                >
                  {staticJSXContent}
                </Route>
              ),
            )}
          </FlatRoutes>
        </Root>
      </AppRouter>
    </AppProvider>
  );
};

export default AppBase;
