import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import React from 'react';
import { PipelineRunKind } from '../types/pipelineRun';
import { TaskRunKind } from '../types/taskRun';
import { getLatestRun } from '../utils/pipelineRun-utils';
import { getTektonResourcesFromClusters } from '../utils/tekton-utils';

type PipelineResourcesType = {
  pipelineRun: PipelineRunKind | null;
  taskRuns: TaskRunKind[] | [];
};

export const useWatchLatestPipelineRun = (
  k8sObjectsResponse: KubernetesObjects,
): PipelineResourcesType | undefined => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [resources, setResources] = React.useState<PipelineResourcesType>();

  React.useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const tektonResources = getTektonResourcesFromClusters(kubernetesObjects);
      if (tektonResources) {
        const latestPipelineRun = getLatestRun(
          tektonResources.pipelineRuns ?? [],
          'creationTimestamp',
        );

        setResources({
          pipelineRun: latestPipelineRun,
          taskRuns: tektonResources.taskRuns,
        });
      }
    }
  }, [loading, kubernetesObjects, error]);

  return resources;
};
