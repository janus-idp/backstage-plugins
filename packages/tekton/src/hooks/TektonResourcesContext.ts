import React from 'react';

import { TektonResourcesContextData } from '../types/types';

export const TektonResourcesContext =
  React.createContext<TektonResourcesContextData>({
    clusters: [],
    setSelectedCluster: () => {},
  });
