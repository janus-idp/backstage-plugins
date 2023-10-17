import React from 'react';

import { computedStatus } from '@janus-idp/shared-react';

import { TektonResourcesContextData } from '../types/types';

export const TektonResourcesContext =
  React.createContext<TektonResourcesContextData>({
    clusters: [],
    selectedStatus: computedStatus.All,
    setSelectedCluster: () => {},
    setSelectedStatus: () => {},
    setIsExpanded: () => {},
  });
