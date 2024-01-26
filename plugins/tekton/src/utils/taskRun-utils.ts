import { V1Pod } from '@kubernetes/client-node';

import {
  ComputedStatus,
  pipelineRunFilterReducer,
  TaskRunKind,
} from '@janus-idp/shared-react';

import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
} from '../consts/tekton-const';
import {
  ComponentEnterpriseContractResult,
  ENTERPRISE_CONTRACT_POLICY_STATUS,
  EnterpriseContractPolicy,
  EnterpriseContractResult,
  EnterpriseContractRule,
  OutputPodGroup,
  OutputTaskRunGroup,
} from '../types/output';
import {
  TaskRunResultsAnnotations,
  TaskRunResultsFormatValue,
  TaskRunResultsKeyValue,
  TaskRunResultsTypeValue,
} from '../types/taskRun';

export type TaskStep = {
  id: string;
  name: string;
  status: ComputedStatus;
  startedAt?: string;
  endedAt?: string;
};

export const getSortedTaskRuns = (tRuns: TaskRunKind[]): TaskStep[] => {
  if (!tRuns || tRuns.length === 0) {
    return [];
  }
  const taskRuns = Array.from(tRuns).sort((a, b) => {
    if (a.status?.completionTime) {
      return b.status?.completionTime &&
        new Date(a.status?.completionTime ?? '') >
          new Date(b.status.completionTime)
        ? 1
        : -1;
    }
    return b.status?.completionTime ||
      new Date(a.status?.startTime ?? '') > new Date(b.status?.startTime ?? '')
      ? 1
      : -1;
  });
  return (taskRuns?.map(tr => {
    return {
      id: tr.metadata?.name,
      name: tr.metadata?.labels?.[TEKTON_PIPELINE_TASK],
      status: pipelineRunFilterReducer(tr),
      startedAt: tr.status?.startTime,
      endedAt: tr.status?.completionTime,
    };
  }) || []) as TaskStep[];
};

export const getActiveTaskRun = (
  taskRuns: TaskStep[],
  activeTask: string | undefined,
): string | undefined =>
  activeTask
    ? taskRuns.find(taskRun => taskRun?.id === activeTask)?.id
    : taskRuns[taskRuns.length - 1]?.id;

const checkTypeAnnotation = (
  tr: TaskRunKind | undefined,
  type: TaskRunResultsTypeValue,
): boolean =>
  tr?.metadata?.annotations?.[TaskRunResultsAnnotations.TYPE] === type;

export const isSbomTaskRun = (tr: TaskRunKind | undefined): boolean =>
  tr?.metadata?.annotations?.[TaskRunResultsAnnotations.KEY] ===
  TaskRunResultsKeyValue.SBOM;

export const isECTaskRun = (tr: TaskRunKind | undefined): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.EC);

export const isACSImageScanTaskRun = (tr: TaskRunKind | undefined): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.ROXCTL_IMAGE_SCAN);

export const isACSImageCheckTaskRun = (tr: TaskRunKind | undefined): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.ROXCTL_IMAGE_CHECK);

export const isACSDeploymentCheckTaskRun = (
  tr: TaskRunKind | undefined,
): boolean =>
  checkTypeAnnotation(tr, TaskRunResultsTypeValue.ROXCTL_DEPLOYMENT_CHECK);

export const getTaskrunsOutputGroup = (
  pipelineRunName: string | undefined,
  taskruns: TaskRunKind[],
): OutputTaskRunGroup => {
  const getPLRTaskRunByType = (
    check: (tr: TaskRunKind | undefined) => boolean,
  ): TaskRunKind | undefined =>
    taskruns?.find(
      (tr: TaskRunKind) =>
        tr?.metadata?.labels?.[TEKTON_PIPELINE_RUN] === pipelineRunName &&
        check(tr),
    );

  return {
    sbomTaskRun: getPLRTaskRunByType(isSbomTaskRun),
    ecTaskRun: getPLRTaskRunByType(isECTaskRun),
    acsImageScanTaskRun: getPLRTaskRunByType(isACSImageScanTaskRun),
    acsImageCheckTaskRun: getPLRTaskRunByType(isACSImageCheckTaskRun),
    acsDeploymentCheckTaskRun: getPLRTaskRunByType(isACSDeploymentCheckTaskRun),
  };
};

export const getPodsOutputGroup = (
  outputTaskGroup: OutputTaskRunGroup,
  pods: V1Pod[],
): OutputPodGroup => {
  const {
    acsImageScanTaskRun,
    acsImageCheckTaskRun,
    acsDeploymentCheckTaskRun,
    ecTaskRun,
    sbomTaskRun,
  } = outputTaskGroup;

  const getTRPods = (podName: string | undefined): V1Pod | undefined =>
    pods?.find((pod: V1Pod) => pod?.metadata?.name === podName);

  return {
    sbomPod: getTRPods(sbomTaskRun?.status?.podName),
    ecPod: getTRPods(ecTaskRun?.status?.podName),
    acsImageScanPod: getTRPods(acsImageScanTaskRun?.status?.podName),
    acsImageCheckPod: getTRPods(acsImageCheckTaskRun?.status?.podName),
    acsDeploymentCheckPod: getTRPods(
      acsDeploymentCheckTaskRun?.status?.podName,
    ),
  };
};

export const hasExternalLink = (
  sbomTaskRun: TaskRunKind | undefined,
): boolean =>
  sbomTaskRun?.metadata?.annotations?.[TaskRunResultsAnnotations.TYPE] ===
  TaskRunResultsTypeValue.EXTERNAL_LINK;

export const getSbomLink = (
  sbomTaskRun: TaskRunKind | undefined,
): string | undefined =>
  (sbomTaskRun?.status?.results || sbomTaskRun?.status?.taskResults)?.find(
    r => r.name === TaskRunResultsKeyValue.SBOM,
  )?.value;

export const formatData = (format: string, data: string) => {
  const parseJson = (d: string) => {
    try {
      return JSON.parse(d);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('error parsing data', e);
      return '';
    }
  };
  switch (format) {
    case TaskRunResultsFormatValue.JSON:
      return data ? parseJson(data) : data;
    case TaskRunResultsFormatValue.YAML:
    case TaskRunResultsFormatValue.TEXT:
    default:
      return data;
  }
};

export const mapEnterpriseContractResultData = (
  ecResult: EnterpriseContractResult,
): EnterpriseContractPolicy[] => {
  const components = ecResult
    ? ecResult.components?.filter((comp: ComponentEnterpriseContractResult) => {
        return !(
          comp.violations &&
          comp.violations?.length === 1 &&
          !comp.violations[0].metadata &&
          comp.violations[0].msg.includes('404 Not Found')
        );
      })
    : [];

  return components?.reduce(
    (
      acc: EnterpriseContractPolicy[],
      compResult: ComponentEnterpriseContractResult,
    ) => {
      compResult?.violations?.forEach((v: EnterpriseContractRule) => {
        const rule: EnterpriseContractPolicy = {
          title: v.metadata?.title ?? '',
          description: v.metadata?.description ?? '',
          status: ENTERPRISE_CONTRACT_POLICY_STATUS.failed,
          timestamp: v.metadata?.effective_on,
          component: compResult.name,
          msg: v.msg,
          collection: v.metadata?.collections,
          solution: v.metadata?.solution,
        };
        acc.push(rule);
      });
      compResult?.warnings?.forEach((w: EnterpriseContractRule) => {
        const rule: EnterpriseContractPolicy = {
          title: w.metadata?.title ?? '',
          description: w.metadata?.description ?? '',
          status: ENTERPRISE_CONTRACT_POLICY_STATUS.warnings,
          timestamp: w.metadata?.effective_on,
          component: compResult.name,
          msg: w.msg,
          collection: w.metadata?.collections,
        };
        acc.push(rule);
      });
      compResult?.successes?.forEach((s: EnterpriseContractRule) => {
        const rule: EnterpriseContractPolicy = {
          title: s.metadata?.title ?? '',
          description: s.metadata?.description ?? '',
          status: ENTERPRISE_CONTRACT_POLICY_STATUS.successes,
          component: compResult.name,
          collection: s.metadata?.collections,
        };
        acc.push(rule);
      });

      return acc;
    },
    [],
  ) as EnterpriseContractPolicy[];
};
