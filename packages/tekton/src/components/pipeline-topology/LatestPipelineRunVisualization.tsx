import React from 'react';
import { PipelineVisualization } from './PipelineVisualization';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ModelsPlural } from '../../models';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';

type LatestPipelineRunVisualizationProps = {
  linkTekton?: boolean;
  url?: string;
};

export const LatestPipelineRunVisualization: React.FC<
  LatestPipelineRunVisualizationProps
> = ({ linkTekton, url }) => {
  const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);

  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      <PipelineVisualization linkTekton={linkTekton} url={url} />
    </TektonResourcesContext.Provider>
  );
};
