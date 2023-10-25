import React, { createContext } from 'react';

import { ScalprumComponentProps } from '@scalprum/react-core';

export type RouteBinding = {
  bindTarget: string;
  bindMap: {
    [target: string]: string;
  };
};

export type DynamicModuleEntry = Pick<
  ScalprumComponentProps,
  'scope' | 'module'
> & {
  manifestLocation: string;
};
export type DynamicRootContextValue = DynamicModuleEntry & {
  path: string;
  Component: React.ComponentType<any>;
};
const DynamicRootContext = createContext<{
  AppRouter: React.ComponentType<React.PropsWithChildren<{}>>;
  AppProvider: React.ComponentType<React.PropsWithChildren<{}>>;
  dynamicRoutes: DynamicRootContextValue[];
}>({
  AppProvider: ({ children }) => <>{children}</>,
  AppRouter: ({ children }) => <>{children}</>,
  dynamicRoutes: [],
});

export default DynamicRootContext;
