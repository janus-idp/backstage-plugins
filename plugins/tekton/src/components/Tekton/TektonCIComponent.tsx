import React from 'react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';
import { ModelsPlural } from '../../models';
import PipelineRunList from '../PipelineRunList/PipelineRunList';

export const TektonCIComponent = () => {
  useDarkTheme();

  const watchedResources = [
    ModelsPlural.pipelineruns,
    ModelsPlural.taskruns,
    ModelsPlural.pods,
  ];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);

  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      <PipelineRunList />
    </TektonResourcesContext.Provider>
  );
};
