/**
 * Necessary nested module override as it is not yet exposed by backstage
 * and backstage uses cross mono-repo imports.
 */

import React, { createContext, ReactNode } from 'react';

import { RouteRef } from '@backstage/core-plugin-api';

export interface RoutingContextType {
  resolve(
    routeRef: RouteRef,
    options: { pathname: string },
  ): (() => string) | undefined;
}

export const RoutingContext = createContext<RoutingContextType>({
  resolve: () => () => '',
});

export class RouteResolver {
  constructor(private readonly routePaths: Map<RouteRef, string>) {}

  resolve(anyRouteRef: RouteRef<{}>): (() => string) | undefined {
    const basePath = this.routePaths.get(anyRouteRef);
    if (!basePath) {
      return undefined;
    }
    return () => basePath;
  }
}

export function RoutingProvider(props: {
  routePaths: Map<RouteRef, string>;
  children?: ReactNode;
}) {
  return (
    <RoutingContext.Provider value={new RouteResolver(props.routePaths)}>
      {props.children}
    </RoutingContext.Provider>
  );
}
