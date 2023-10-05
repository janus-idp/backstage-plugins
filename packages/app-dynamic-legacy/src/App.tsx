import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Route } from 'react-router';

import { createApp } from '@backstage/app-defaults';
import { BackstageApp, FlatRoutes } from '@backstage/core-app-api';
import { AlertDisplay, OAuthRequestDialog } from '@backstage/core-components';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { orgPlugin } from '@backstage/plugin-org';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';

import { processManifest } from '@scalprum/core';
import { ScalprumProvider, useScalprum } from '@scalprum/react-core';

import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { Root } from './components/Root';
import { searchPage } from './components/search/SearchPage';

type RemoteComponentTypes = {
  UserSettingsPage: React.ComponentType;
  TechRadarPage: React.ComponentType<{ width?: number; height?: number }>;
  ScaffolderPage: React.ComponentType;
  AppProvider: React.ComponentType<React.PropsWithChildren<{}>>;
  AppRouter: React.ComponentType<React.PropsWithChildren<{}>>;
};

const App = ({
  remoteComponents,
}: {
  remoteComponents: RemoteComponentTypes;
}) => {
  // Reason for this is the fact that backstage requires specific elements in their routes as they are scanned for some data
  // Maybe later we will be able to use the ScalprumComponent directly in the routes
  const {
    AppProvider,
    AppRouter,
    UserSettingsPage,
    TechRadarPage,
    ScaffolderPage,
  } = remoteComponents;
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
            <Route path="/create" element={<ScaffolderPage />} />
            <Route path="/api-docs" element={<ApiExplorerPage />} />
            <Route
              path="/tech-radar"
              element={<TechRadarPage width={1500} height={800} />}
            />
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
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="/catalog-graph" element={<CatalogGraphPage />} />
          </FlatRoutes>
        </Root>
      </AppRouter>
    </AppProvider>
  );
};

const manifestLocation = 'http://localhost:8004/plugin-manifest.json';
const remotePluginId = 'janus.dynamic-frontend-plugin';
const remotePlugins = [
  './UserSettingsPageLegacy',
  './TechRadarPage',
  './Scaffolder',
];

// const scalprum = initialize({appsConfig: {}})
const ScalprumRoot = () => {
  const { initialized, pluginStore } = useScalprum();
  const app = useRef<BackstageApp>();
  const [remoteComponents, setRemotePlugins] = useState<
    RemoteComponentTypes | undefined
  >(undefined);

  const initializeRemotePlugins = async () => {
    const processManifestPromises = remotePlugins.map(moduleId =>
      processManifest(manifestLocation, remotePluginId, moduleId),
    );
    await Promise.all(processManifestPromises);
    const remoteContainerPromises = remotePlugins.map(moduleId =>
      pluginStore.getExposedModule<{
        default: React.ComponentType;
        UserSettingsPage: React.ComponentType;
        ScaffolderPage: React.ComponentType;
        scaffolderPlugin: any;
      }>(remotePluginId, moduleId),
    );
    const [UserSettingsPageLegacyRemote, TechRadarRemote, Scaffolder] =
      await Promise.all(remoteContainerPromises);

    // needs to be called before state mutation because ref is not mutable
    if (!app.current) {
      app.current = createApp({
        apis,
        bindRoutes({ bind }) {
          bind(catalogPlugin.externalRoutes, {
            createComponent: Scaffolder.scaffolderPlugin.routes.root,
            viewTechDoc: techdocsPlugin.routes.docRoot,
          });
          bind(apiDocsPlugin.externalRoutes, {
            registerApi: catalogImportPlugin.routes.importPage,
          });
          bind(Scaffolder.scaffolderPlugin.externalRoutes, {
            registerComponent: catalogImportPlugin.routes.importPage,
          });
          bind(orgPlugin.externalRoutes, {
            catalogIndex: catalogPlugin.routes.catalogIndex,
          });
        },
      });
    }
    setRemotePlugins({
      UserSettingsPage: UserSettingsPageLegacyRemote.UserSettingsPage,
      TechRadarPage: TechRadarRemote.default,
      ScaffolderPage: Scaffolder.ScaffolderPage,
      AppProvider: app.current.getProvider(),
      AppRouter: app.current.getRouter(),
    });
  };
  useEffect(() => {
    if (initialized && !remoteComponents) {
      initializeRemotePlugins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, remoteComponents]);

  if (!remoteComponents || !initialized || !app.current) {
    return null;
  }

  return <App remoteComponents={remoteComponents} />;
};

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
      <ScalprumRoot />
    </ScalprumProvider>
  );
};

export default AppRoot;
