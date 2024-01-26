import React from 'react';

import {
  ComputedStatus,
  PipelineRunKind,
  pipelineRunStatus,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { OutputGroup } from '../types/output';
import {
  TaskRunResultsAnnotations,
  TaskRunResultsFormatValue,
} from '../types/taskRun';
import {
  formatData,
  getPodsOutputGroup,
  getTaskrunsOutputGroup,
  mapEnterpriseContractResultData,
} from '../utils/taskRun-utils';
import { TektonResourcesContext } from './TektonResourcesContext';
import { usePodContainerLogs } from './usePodContainerLogs';

export const usePipelineRunOutputData = (
  pipelineRun: PipelineRunKind,
  taskRuns: TaskRunKind[],
): OutputGroup => {
  const { loaded: allResourceLoaded, watchResourcesData } = React.useContext(
    TektonResourcesContext,
  );
  const pods = React.useMemo(
    () => watchResourcesData?.pods?.data || [],
    [watchResourcesData],
  );
  const {
    acsImageScanTaskRun,
    acsImageCheckTaskRun,
    acsDeploymentCheckTaskRun,
    ecTaskRun,
  } = getTaskrunsOutputGroup(pipelineRun?.metadata?.name, taskRuns);

  const { acsImageScanPod, acsImageCheckPod, acsDeploymentCheckPod, ecPod } =
    getPodsOutputGroup(
      {
        acsImageScanTaskRun,
        acsImageCheckTaskRun,
        acsDeploymentCheckTaskRun,
        ecTaskRun,
      },
      pods,
    );

  const getTaskRunFormat = (obj: TaskRunKind | undefined): string =>
    obj?.metadata?.annotations?.[TaskRunResultsAnnotations.FORMAT] ??
    TaskRunResultsFormatValue.TEXT;

  const getTaskRunContainer = (obj: TaskRunKind | undefined): string =>
    obj?.metadata?.annotations?.[TaskRunResultsAnnotations.CONTAINER] ??
    'step-report';

  const { value, loading } = usePodContainerLogs({
    pod: acsImageScanPod,
    containerName: getTaskRunContainer(acsImageScanTaskRun),
  });

  const { value: acsValue, loading: acsImageCheckLoading } =
    usePodContainerLogs({
      pod: acsImageCheckPod,
      containerName: getTaskRunContainer(acsImageCheckTaskRun),
    });

  const { value: acsDcValue, loading: acsDeploymentCheckLoading } =
    usePodContainerLogs({
      pod: acsDeploymentCheckPod,
      containerName: getTaskRunContainer(acsDeploymentCheckTaskRun),
    });

  const { value: ecValue, loading: ecLoading } = usePodContainerLogs({
    pod: ecPod,
    containerName: getTaskRunContainer(ecTaskRun),
  });

  const acsImageScanData = formatData(
    getTaskRunFormat(acsImageScanTaskRun),
    value?.text ?? '',
  );
  const acsImageCheckData = formatData(
    getTaskRunFormat(acsImageCheckTaskRun),
    acsValue?.text ?? '',
  );
  const acsDeploymentCheckData = formatData(
    getTaskRunFormat(acsDeploymentCheckTaskRun),
    acsDcValue?.text ?? '',
  );
  const ecData = mapEnterpriseContractResultData(
    formatData(getTaskRunFormat(ecTaskRun), ecValue?.text ?? ([] as any)),
  );

  return {
    results: {
      status: pipelineRunStatus(pipelineRun),
      loading: pipelineRunStatus(pipelineRun) !== ComputedStatus.Succeeded,
      data:
        pipelineRun?.status?.pipelineResults ||
        pipelineRun?.status?.results ||
        [],
    },
    ec: {
      data: ecData,
      loading: !!allResourceLoaded && !ecPod ? false : ecLoading,
      pod: ecPod,
      taskRun: ecTaskRun,
    },
    acsImageScan: {
      data: acsImageScanData,
      loading: !!allResourceLoaded && !acsImageScanPod ? false : loading,
      pod: acsImageScanPod,
      taskRun: acsImageScanTaskRun,
    },
    acsImageCheck: {
      data: acsImageCheckData,
      loading:
        !!allResourceLoaded && !acsImageCheckPod ? false : acsImageCheckLoading,
      pod: acsImageCheckPod,
      taskRun: acsImageCheckTaskRun,
    },
    acsDeploymentCheck: {
      data: acsDeploymentCheckData,
      loading:
        !!allResourceLoaded && !acsDeploymentCheckPod
          ? false
          : acsDeploymentCheckLoading,
      pod: acsDeploymentCheckPod,
      taskRun: acsDeploymentCheckTaskRun,
    },
  };
};
