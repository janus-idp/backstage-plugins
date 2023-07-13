import React from 'react';
import { useParams } from 'react-router-dom';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';
import { ModelsPlural } from '../../models';
import { PipelineVisualizationCard } from './PipelineVisualizationCard';
import { PipelineVisualizationView } from './PipelineVisualizationView';

type PipelineRunVisualizationProps = {
  linkTekton?: boolean;
  url?: string;
};

export const PipelineRunVisualization = ({
  linkTekton,
  url,
}: PipelineRunVisualizationProps) => {
  const { pipelineRunName } = useParams();
  useDarkTheme();
  const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);

  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      {pipelineRunName ? (
        <PipelineVisualizationView pipelineRun={pipelineRunName} />
      ) : (
        <PipelineVisualizationCard linkTekton={linkTekton} url={url} />
      )}
    </TektonResourcesContext.Provider>
  );
};
