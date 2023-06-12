import {
  PipelineKind,
  PipelineRunKind,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { INSTANCE_LABEL } from '../const';
import { PipelinesData } from '../types/pipeline';
import { K8sResponseData, K8sWorkloadResource } from '../types/types';

const byCreationTime = (left: any, right: any): number => {
  const leftCreationTime = new Date(
    left?.metadata?.creationTimestamp || Date.now(),
  );
  const rightCreationTime = new Date(
    right?.metadata?.creationTimestamp || Date.now(),
  );
  return rightCreationTime.getTime() - leftCreationTime.getTime();
};

export const getPipelineRunsForPipeline = (
  pipeline: PipelineKind,
  resources: K8sResponseData,
): PipelineRunKind[] => {
  if (!resources.pipelineruns?.data?.length) {
    return [];
  }
  const pipelineRunsData = resources.pipelineruns.data as PipelineRunKind[];
  const PIPELINE_RUN_LABEL = 'tekton.dev/pipeline';
  const pipelineName = pipeline?.metadata?.name;
  return pipelineRunsData
    .filter((pr: PipelineRunKind) => {
      return (
        pipelineName ===
        (pr.spec?.pipelineRef?.name ||
          pr?.metadata?.labels?.[PIPELINE_RUN_LABEL])
      );
    })
    .sort(byCreationTime);
};

export const getPipelinesDataForResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): PipelinesData | null => {
  if (!resources.pipelines?.data?.length) {
    return null;
  }
  const pipelinesData = resources.pipelines.data as PipelineKind[];
  const resourceInstanceName =
    resource?.metadata?.labels?.[INSTANCE_LABEL] || null;
  if (!resourceInstanceName) return null;
  const resourcePipeline = pipelinesData.find(
    pl => pl.metadata?.labels?.[INSTANCE_LABEL] === resourceInstanceName,
  );

  if (!resourcePipeline) return null;

  return {
    pipelines: [resourcePipeline],
    pipelineRuns: getPipelineRunsForPipeline(resourcePipeline, resources) ?? [],
    taskRuns: (resources?.taskruns?.data as TaskRunKind[]) ?? [],
  };
};
