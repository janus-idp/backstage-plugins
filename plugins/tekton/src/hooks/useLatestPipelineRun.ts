import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import { useDebounceCallback } from './debounce';
import { useWatchLatestPipelineRun } from './useWatchLatestPipelineRun';
import { PipelineRunKind } from '../types/pipelineRun';
import { TaskRunKind } from '../types/taskRun';

type PipelineResourcesType = {
  pipelineRun: PipelineRunKind | null;
  taskRuns: TaskRunKind[] | [];
};

export const useLatestPipelineRun = (): [PipelineResourcesType, boolean] => {
  const [pipelineResources, setPipelineResources] =
    React.useState<PipelineResourcesType>({
      pipelineRun: null,
      taskRuns: [],
    });
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);

  const watchPipelineResourcesData = useWatchLatestPipelineRun({
    kubernetesObjects,
    loading,
    error,
  });

  const updateResults = React.useCallback(
    (resData, isLoading, errorData) => {
      if (!isLoading && !errorData) {
        setLoaded(true);
        setPipelineResources(resData);
      }
    },
    [setPipelineResources, setLoaded],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(watchPipelineResourcesData, loading, error);
  }, [debouncedUpdateResources, watchPipelineResourcesData, loading, error]);
  return [pipelineResources, loaded];
};
