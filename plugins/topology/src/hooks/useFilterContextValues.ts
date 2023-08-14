import * as React from 'react';

import { TOPOLOGY_FILTERS } from '../const';
import { DisplayFilters, FilterContextType } from '../types/types';

export const useFilterContextValues = (): FilterContextType => {
  const [filters, setFilters] =
    React.useState<DisplayFilters>(TOPOLOGY_FILTERS);

  return { filters, setAppliedTopologyFilters: setFilters };
};
