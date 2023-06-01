import React from 'react';

import { K8sResourcesContextData } from '../types/types';

export const K8sResourcesContext = React.createContext<K8sResourcesContextData>({
  clusters: [],
  setSelectedCluster: () => {},
});
