import React, { PropsWithChildren, useRef } from 'react';

import { createApp } from '@backstage/app-defaults';
import { BackstageApp } from '@backstage/core-app-api';
import { apiDocsPlugin } from '@backstage/plugin-api-docs';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { catalogImportPlugin } from '@backstage/plugin-catalog-import';
import { orgPlugin } from '@backstage/plugin-org';

import { apis } from '../../apis';
import DynamicRootContext from '../../DynamicRoot/DynamicRootContext';

const TestRoot = ({ children }: PropsWithChildren<{}>) => {
  const { current } = useRef<BackstageApp>(
    createApp({
      apis,
      bindRoutes: ({ bind }) => {
        // Static bindings
        bind(apiDocsPlugin.externalRoutes, {
          registerApi: catalogImportPlugin.routes.importPage,
        });
        bind(orgPlugin.externalRoutes, {
          catalogIndex: catalogPlugin.routes.catalogIndex,
        });
      },
    }),
  );
  return (
    <DynamicRootContext.Provider
      value={{
        AppProvider: current.getProvider(),
        AppRouter: current.getRouter(),
        dynamicRoutes: [],
      }}
    >
      {children}
    </DynamicRootContext.Provider>
  );
};

export default TestRoot;
