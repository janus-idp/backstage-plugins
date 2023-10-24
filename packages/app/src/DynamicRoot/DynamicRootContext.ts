import { createContext } from 'react';

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
  AppRouter: React.ComponentType;
  AppProvider: React.ComponentType;
  dynamicRoutes: DynamicRootContextValue[];
}>({
  AppProvider: () => null,
  AppRouter: () => null,
  dynamicRoutes: [],
});

export default DynamicRootContext;
