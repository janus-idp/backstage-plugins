import * as React from 'react';
import { ModelsPlural } from '../../models';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import PipelineRunList from '../PipelineRunList/PipelineRunList';
import { useDarkTheme } from '../../hooks/useDarkTheme';

export const TektonComponent = () => {
  useDarkTheme();

  const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);

  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      <PipelineRunList />
    </TektonResourcesContext.Provider>
  );
};
