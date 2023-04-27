import React from 'react';
import { PipelineVisualization } from './PipelineVisualization';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ModelsPlural } from '../../models';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';

export const LatestPipelineRunVisualization = () => {
  const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);

  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      <PipelineVisualization />
    </TektonResourcesContext.Provider>
  );
};
