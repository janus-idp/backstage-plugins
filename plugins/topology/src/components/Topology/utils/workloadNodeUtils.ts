import {
  AllPodStatus,
  DEPLOYMENT_PHASE,
  DEPLOYMENT_STRATEGY,
  podColor,
} from '../components/Pods/pod';
import {
  ExtPodKind,
  PodControllerOverviewItem,
  PodRCData,
} from '../types/pods';
import { ContainerStatus, K8sResourceKind, PodKind } from '../types/types';

export const podStatus = Object.keys(podColor);

const isContainerFailedFilter = (containerStatus: ContainerStatus) => {
  return (
    containerStatus.state?.terminated &&
    containerStatus.state.terminated.exitCode !== 0
  );
};

export const isContainerLoopingFilter = (containerStatus: ContainerStatus) => {
  return (
    containerStatus.state?.waiting &&
    containerStatus.state.waiting.reason === 'CrashLoopBackOff'
  );
};

const numContainersReadyFilter = (pod: PodKind) => {
  const containerStatuses = pod.status?.containerStatuses;
  let numReady = 0;
  containerStatuses?.forEach(status => {
    if (status.ready) {
      numReady++;
    }
  });
  return numReady;
};

const isReady = (pod: PodKind) => {
  const {
    spec: { containers },
  } = pod;
  const numReady = numContainersReadyFilter(pod);
  const total = containers ? Object.keys(containers).length : 0;

  return numReady === total;
};

const podWarnings = (pod: PodKind) => {
  const phase = pod.status?.phase;
  const containerStatuses = pod.status?.containerStatuses;
  if (phase === AllPodStatus.Running && containerStatuses) {
    return containerStatuses
      .map(containerStatus => {
        if (!containerStatus.state) {
          return null;
        }

        if (isContainerFailedFilter(containerStatus)) {
          if (pod.metadata?.deletionTimestamp) {
            return AllPodStatus.Failed;
          }
          return AllPodStatus.Warning;
        }
        if (isContainerLoopingFilter(containerStatus)) {
          return AllPodStatus.CrashLoopBackOff;
        }
        return null;
      })
      .filter(x => x);
  }
  return null;
};

export const getPodStatus = (pod: PodKind) => {
  if (pod.metadata?.deletionTimestamp) {
    return AllPodStatus.Terminating;
  }
  const warnings = podWarnings(pod);
  if (warnings !== null && warnings.length) {
    if (warnings.includes(AllPodStatus.CrashLoopBackOff)) {
      return AllPodStatus.CrashLoopBackOff;
    }
    if (warnings.includes(AllPodStatus.Failed)) {
      return AllPodStatus.Failed;
    }
    return AllPodStatus.Warning;
  }
  const phase = pod.status?.phase ?? AllPodStatus.Unknown;
  if (phase === AllPodStatus.Running && !isReady(pod)) {
    return AllPodStatus.NotReady;
  }
  return AllPodStatus.Unknown;
};

export const calculateRadius = (size: number) => {
  const radius = size / 2;
  const podStatusStrokeWidth = (8 / 104) * size;
  const podStatusInset = (5 / 104) * size;
  const podStatusOuterRadius = radius - podStatusInset;
  const podStatusInnerRadius = podStatusOuterRadius - podStatusStrokeWidth;
  const decoratorRadius = radius * 0.25;

  return {
    radius,
    podStatusInnerRadius,
    podStatusOuterRadius,
    decoratorRadius,
    podStatusStrokeWidth,
    podStatusInset,
  };
};

const getScalingUp = (dc: K8sResourceKind) => {
  return {
    ...(dc.metadata && dc.metadata),
    status: {
      phase: AllPodStatus.ScalingUp,
    },
  };
};

export const podDataInProgress = (
  dc: K8sResourceKind,
  current: PodControllerOverviewItem,
  isRollingOut: boolean,
): boolean => {
  const strategy = dc?.spec?.strategy?.type;
  return (
    current?.phase !== DEPLOYMENT_PHASE.complete &&
    (strategy === DEPLOYMENT_STRATEGY.recreate ||
      strategy === DEPLOYMENT_STRATEGY.rolling) &&
    isRollingOut
  );
};

export const getPodData = (
  podRCData: PodRCData,
): {
  inProgressDeploymentData: ExtPodKind[] | null;
  completedDeploymentData: ExtPodKind[];
} => {
  const strategy = podRCData.obj?.spec?.strategy?.type || null;
  const currentDeploymentphase = podRCData.current && podRCData.current.phase;
  const currentPods = podRCData.current && podRCData.current.pods;
  const previousPods = podRCData.previous && podRCData.previous.pods;
  // DaemonSets and StatefulSets
  if (!strategy)
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: podRCData.pods,
    };

  // Scaling no. of pods
  if (currentDeploymentphase === DEPLOYMENT_PHASE.complete) {
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: currentPods,
    };
  }

  // Deploy - Rolling - Recreate
  if (
    (strategy === DEPLOYMENT_STRATEGY.recreate ||
      strategy === DEPLOYMENT_STRATEGY.rolling ||
      strategy === DEPLOYMENT_STRATEGY.rollingUpdate) &&
    podRCData.isRollingOut
  ) {
    return {
      inProgressDeploymentData: currentPods,
      completedDeploymentData: previousPods,
    };
  }
  // if build is not finished show `Scaling Up` on pod phase
  if (!podRCData.current && podRCData.obj && !podRCData.previous) {
    return {
      inProgressDeploymentData: null,
      completedDeploymentData: [getScalingUp(podRCData.obj)],
    };
  }
  return {
    inProgressDeploymentData: null,
    completedDeploymentData: podRCData.pods,
  };
};
