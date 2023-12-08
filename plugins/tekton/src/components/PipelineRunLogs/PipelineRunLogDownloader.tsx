import React from 'react';

import { V1Pod } from '@kubernetes/client-node';
import { Flex, FlexItem } from '@patternfly/react-core';

import { PipelineRunKind } from '@janus-idp/shared-react';

import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
  TEKTON_PIPELINE_TASKRUN,
} from '../../consts/tekton-const';
import PodLogsDownloadLink from './PodLogsDownloadLink';

const PipelineRunLogDownloader: React.FC<{
  pods: V1Pod[];
  pipelineRun: PipelineRunKind;
  activeTask: string | undefined;
}> = ({ pods, pipelineRun, activeTask }) => {
  const filteredPods: V1Pod[] = pods?.filter(
    (p: V1Pod) =>
      p?.metadata?.labels?.[TEKTON_PIPELINE_RUN] ===
      pipelineRun?.metadata?.name,
  );

  const sortedPods: V1Pod[] = React.useMemo(
    () =>
      filteredPods?.sort(
        (a: V1Pod, b: V1Pod) =>
          new Date(a?.status?.startTime as Date).getTime() -
          new Date(b?.status?.startTime as Date).getTime(),
      ),
    [filteredPods],
  );

  const activeTaskPod: V1Pod =
    sortedPods.find(
      (sp: V1Pod) =>
        sp.metadata?.labels?.[TEKTON_PIPELINE_TASKRUN] === activeTask,
    ) || sortedPods[sortedPods.length - 1];

  return (
    <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
      <FlexItem>
        <PodLogsDownloadLink
          pods={[activeTaskPod]}
          fileName={`${activeTaskPod?.metadata?.labels?.[TEKTON_PIPELINE_TASK]}.log`}
          downloadTitle="Download"
        />
      </FlexItem>
      <FlexItem>
        <PodLogsDownloadLink
          pods={sortedPods}
          fileName={`${pipelineRun?.metadata?.name}.log`}
          downloadTitle="Download all tasks logs"
        />
      </FlexItem>
    </Flex>
  );
};
export default PipelineRunLogDownloader;
