import React, { useCallback, useEffect, useRef, useState } from 'react';

import { createApp } from '@backstage/app-defaults';
import { BackstageApp } from '@backstage/core-app-api';
import { AnyApiFactory } from '@backstage/core-plugin-api';
import { apiDocsPlugin } from '@backstage/plugin-api-docs';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { catalogImportPlugin } from '@backstage/plugin-catalog-import';
import { orgPlugin } from '@backstage/plugin-org';
import { techdocsPlugin } from '@backstage/plugin-techdocs';

import { processManifest } from '@scalprum/core';
import { useScalprum } from '@scalprum/react-core';
import get from 'lodash/get';

import dynamicModuleRegistry from './dynamic-modules-registry.json';
import DynamicRootContext, {
  DynamicModuleEntry,
  DynamicRootContextValue,
  RouteBinding,
} from './DynamicRootContext';

const scalprumRoutes = dynamicModuleRegistry as DynamicModuleEntry[];

// Custom properties of plugin manifest
type CustomProperties = {
  dynamicRoutes: (DynamicModuleEntry & {
    importName: string;
    path: string;
  })[];
  routeBindings: RouteBinding[];
};

type AppConfig = {
  context: string;
  data: {
    dynamicPlugins?: {
      frontend?: {
        [key: string]: CustomProperties;
      };
    };
  };
};

const DynamicRoot = ({
  children,
  apis,
}: React.PropsWithChildren<{
  // Static APIs
  apis: AnyApiFactory[];
}>) => {
  const app = useRef<BackstageApp>();
  // registry of remote components loaded at bootstrap
  const [components, setComponents] = useState<
    | {
        AppProvider: React.ComponentType;
        AppRouter: React.ComponentType;
        dynamicRoutes: DynamicRootContextValue[];
      }
    | undefined
  >();
  const { initialized, pluginStore } = useScalprum();

  // Fills registry of remote components
  const initializeRemoteModules = useCallback(async () => {
    // Initialized remote modules if pluginStore
    const manifestPromises = scalprumRoutes.map(
      ({ manifestLocation, scope, module }) =>
        processManifest(manifestLocation, scope, module),
    );
    await Promise.all(manifestPromises);
    // Create a map of remote plugins
    const remotePlugins = (
      await Promise.all(
        scalprumRoutes.map(({ scope, module }) =>
          pluginStore
            .getExposedModule<{
              [importName: string]: React.ComponentType<{}>;
            }>(scope, module)
            .then(remoteModule => ({
              [module]: remoteModule,
            })),
        ),
      )
    ).reduce((acc, module) => ({ ...acc, ...module }), {});

    // Extract routes lists and app bindings from the app config file
    const { remoteComponents, routeBindings } = (
      process.env.APP_CONFIG as unknown as AppConfig[]
    )?.reduce<{
      routeBindings: RouteBinding[];
      remoteComponents: DynamicRootContextValue[];
    }>(
      (acc, { data }) => {
        if (data?.dynamicPlugins?.frontend) {
          acc.remoteComponents.push(
            ...Object.entries(data.dynamicPlugins.frontend).reduce<
              DynamicRootContextValue[]
            >((pluginSet, [_, customProperties]) => {
              pluginSet.push(
                ...customProperties.dynamicRoutes.map(route => ({
                  ...route,
                  Component: remotePlugins[route.module][
                    route.importName ?? 'default'
                  ] as React.ComponentType,
                })),
              );
              return pluginSet;
            }, []),
          );
          acc.routeBindings.push(
            ...Object.entries(data.dynamicPlugins.frontend).reduce<
              RouteBinding[]
            >((pluginSet, [_, customProperties]) => {
              pluginSet.push(...customProperties.routeBindings);
              return pluginSet;
            }, []),
          );
        }
        return acc;
      },
      { routeBindings: [], remoteComponents: [] },
    ) || { routeBindings: [], remoteComponents: [] }; // fallback to empty arrays

    if (!app.current) {
      app.current = createApp({
        apis,
        bindRoutes({ bind }) {
          // Static bindings
          bind(apiDocsPlugin.externalRoutes, {
            registerApi: catalogImportPlugin.routes.importPage,
          });
          bind(orgPlugin.externalRoutes, {
            catalogIndex: catalogPlugin.routes.catalogIndex,
          });

          const availableBindPlugins = {
            remotePlugins,
            catalogPlugin,
            catalogImportPlugin,
            techdocsPlugin,
          };
          // binds from remote
          routeBindings.forEach(({ bindTarget, bindMap }) => {
            bind(
              get(availableBindPlugins, bindTarget),
              Object.entries(bindMap).reduce<{ [key: string]: any }>(
                (acc, [key, value]) => {
                  acc[key] = get(availableBindPlugins, value);
                  return acc;
                },
                {},
              ) as any,
            );
          });
        },
      });
    }
    setComponents({
      AppProvider: app.current.getProvider(),
      AppRouter: app.current.getRouter(),
      dynamicRoutes: remoteComponents,
    });
  }, [pluginStore, apis]);

  useEffect(() => {
    if (initialized && !components) {
      initializeRemoteModules();
    }
  }, [initialized, components, initializeRemoteModules]);

  if (!initialized || !components) {
    return null;
  }
  return (
    <DynamicRootContext.Provider value={components}>
      {children}
    </DynamicRootContext.Provider>
  );
};

export default DynamicRoot;
