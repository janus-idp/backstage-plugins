import React from 'react';

import { ComputedStatus } from '@janus-idp/shared-react';

import { TektonResourcesContextData } from '../types/types';

export const TektonResourcesContext =
  React.createContext<TektonResourcesContextData>({
    clusters: [],
    selectedStatus: ComputedStatus.All,
    setSelectedCluster: () => {},
    setSelectedStatus: () => {},
    setIsExpanded: () => {},
  });
