import React, { useContext } from 'react';
import { Navigate, Route } from 'react-router';

import { FlatRoutes } from '@backstage/core-app-api';
import { AlertDisplay, OAuthRequestDialog } from '@backstage/core-components';
import { ApiExplorerPage } from '@backstage/plugin-api-docs';
import { CatalogEntityPage, CatalogIndexPage } from '@backstage/plugin-catalog';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { CatalogImportPage } from '@backstage/plugin-catalog-import';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';

import { ScalprumProvider } from '@scalprum/react-core';

import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { Root } from './components/Root';
import { searchPage } from './components/search/SearchPage';
import DynamicRoot from './DynamicRoot';
import DynamicRootContext from './DynamicRoot/DynamicRootContext';

export const AppBase = () => {
  const { AppProvider, AppRouter, dynamicRoutes } =
    useContext(DynamicRootContext);
  return (
    <AppProvider>
      <AlertDisplay />
      <OAuthRequestDialog />
      <AppRouter>
        <Root>
          <FlatRoutes>
            <Route path="/" element={<Navigate to="catalog" />} />
            <Route path="/catalog" element={<CatalogIndexPage />} />
            <Route
              path="/catalog/:namespace/:kind/:name"
              element={<CatalogEntityPage />}
            >
              {entityPage}
            </Route>
            <Route path="/docs" element={<TechDocsIndexPage />} />
            <Route
              path="/docs/:namespace/:kind/:name/*"
              element={<TechDocsReaderPage />}
            >
              <TechDocsAddons>
                <ReportIssue />
              </TechDocsAddons>
            </Route>
            <Route path="/api-docs" element={<ApiExplorerPage />} />
            <Route
              path="/catalog-import"
              element={
                <RequirePermission permission={catalogEntityCreatePermission}>
                  <CatalogImportPage />
                </RequirePermission>
              }
            />
            <Route path="/search" element={<SearchPage />}>
              {searchPage}
            </Route>
            <Route path="/catalog-graph" element={<CatalogGraphPage />} />
            {dynamicRoutes.map(({ Component, path, ...props }) => (
              <Route
                key={path}
                path={path}
                element={<Component {...props} />}
              />
            ))}
          </FlatRoutes>
        </Root>
      </AppRouter>
    </AppProvider>
  );
};

const manifestLocation = 'http://localhost:8004/plugin-manifest.json';
const remotePluginId = 'janus.dynamic-frontend-plugin';

const AppRoot = () => {
  return (
    <ScalprumProvider
      pluginSDKOptions={{
        pluginLoaderOptions: {
          postProcessManifest: manifest => {
            return {
              ...manifest,
              loadScripts: manifest.loadScripts.map(
                script => `http://localhost:8004/${script}`,
              ),
            };
          },
        },
      }}
      config={{
        [remotePluginId]: {
          manifestLocation,
          name: remotePluginId,
        },
      }}
    >
      <DynamicRoot apis={apis}>
        <AppBase />
      </DynamicRoot>
    </ScalprumProvider>
  );
};

export default AppRoot;
