import { V1Deployment, V1Pod, V1ReplicaSet } from '@kubernetes/client-node';
import { AllPodStatus } from '../components/Pods/pod';
import { ReplicaSetGVK } from '../models';
import { PodControllerOverviewItem, PodRCData } from '../types/pods';
import {
  GroupVersionKind,
  K8sWorkloadResource,
  K8sResponseData,
} from '../types/types';

// List of container status waiting reason values that we should call out as errors in project status rows.
const CONTAINER_WAITING_STATE_ERROR_REASONS = [
  'CrashLoopBackOff',
  'ErrImagePull',
  'ImagePullBackOff',
];

const DEPLOYMENT_REVISION_ANNOTATION = 'deployment.kubernetes.io/revision';

const apiVersionForModel = (gvk: GroupVersionKind) =>
  !gvk?.apiGroup ? gvk.apiVersion : `${gvk.apiGroup}/${gvk.apiVersion}`;

const getAnnotation = (obj: K8sWorkloadResource, annotation: string) => {
  return obj?.metadata?.annotations?.[annotation];
};

const isIdled = (deployment: K8sWorkloadResource): boolean => {
  return !!deployment.metadata?.annotations?.[
    'idling.alpha.openshift.io/idled-at'
  ];
};

const getDeploymentRevision = (obj: K8sWorkloadResource) => {
  const revision = getAnnotation(obj, DEPLOYMENT_REVISION_ANNOTATION);
  return revision && Number.isFinite(revision) && parseInt(revision, 10);
};

const getOwnedResources = <T extends K8sWorkloadResource>(
  obj: K8sWorkloadResource,
  resources: T[],
): T[] => {
  const uid = obj?.metadata?.uid;
  if (!uid) {
    return [];
  }
  return resources.filter(res => {
    const ownerReferences = res.metadata?.ownerReferences;
    return ownerReferences?.some(
      or => or.uid === uid && or.controller === true,
    );
  });
};

const getActiveReplicaSets = (
  deployment: K8sWorkloadResource,
  resources: K8sResponseData,
) => {
  const { replicasets } = resources;
  const currentRevision = getDeploymentRevision(deployment);
  const ownedRS = getOwnedResources(
    deployment,
    replicasets?.data,
  ) as V1ReplicaSet[];
  return ownedRS.filter(
    rs => rs?.status?.replicas || getDeploymentRevision(rs) === currentRevision,
  );
};

const sortByRevision = (
  replicators: V1ReplicaSet[],
  getRevision: Function,
  descending: boolean = true,
) => {
  const compare = (left: any, right: any) => {
    const leftVersion = getRevision(left);
    const rightVersion = getRevision(right);
    if (!isFinite(leftVersion) && !isFinite(rightVersion)) {
      const leftName = left?.metadata?.name || '';
      const rightName = right?.metadata?.name || '';
      if (descending) {
        return rightName.localeCompare(leftName);
      }
      return leftName.localeCompare(rightName);
    }

    if (!leftVersion) {
      return descending ? 1 : -1;
    }

    if (!rightVersion) {
      return descending ? -1 : 1;
    }

    if (descending) {
      return rightVersion - leftVersion;
    }

    return leftVersion - rightVersion;
  };

  return replicators?.sort(compare);
};

const sortReplicaSetsByRevision = (
  replicaSets: V1ReplicaSet[],
): V1ReplicaSet[] => {
  return sortByRevision(replicaSets, getDeploymentRevision);
};

const getPodsForResource = (
  resource: K8sWorkloadResource,
  resources: K8sResponseData,
): V1Pod[] => {
  const { pods } = resources;
  return getOwnedResources(resource, pods?.data as V1Pod[]);
};

// Only show an alert once if multiple pods have the same error for the same owner.
const podAlertKey = (
  alert: any,
  pod: K8sWorkloadResource,
  containerName: string = 'all',
): string => {
  const id = pod?.metadata?.ownerReferences?.[0]?.uid || pod.metadata?.uid;
  return `${alert}--${id}--${containerName}`;
};

const getPodAlerts = (pod: V1Pod) => {
  const alerts = {} as { [key: string]: any };
  const statuses = [
    ...(pod?.status?.initContainerStatuses
      ? pod.status.initContainerStatuses
      : []),
    ...(pod?.status?.containerStatuses ? pod.status.containerStatuses : []),
  ];
  statuses.forEach(status => {
    const { name, state } = status;
    const waitingReason = state?.waiting?.reason;
    if (
      waitingReason &&
      CONTAINER_WAITING_STATE_ERROR_REASONS.includes(waitingReason)
    ) {
      const key = podAlertKey(waitingReason, pod, name);
      const message = state.waiting?.message || waitingReason;
      alerts[key] = { severity: 'error', message };
    }
  });
  const podStatusConditions = pod?.status?.conditions || [];
  podStatusConditions.forEach((condition: any) => {
    const { type, status, reason, message } = condition;
    if (
      type === 'PodScheduled' &&
      status === 'False' &&
      reason === 'Unschedulable'
    ) {
      const key = podAlertKey(reason, pod);
      alerts[key] = {
        severity: 'error',
        message: `${reason}: ${message}`,
      };
    }
  });

  return alerts;
};

const combinePodAlerts = (pods: V1Pod[]) =>
  pods.reduce(
    (acc, pod) => ({
      ...acc,
      ...getPodAlerts(pod),
    }),
    {},
  );

const toResourceItem = (
  rs: V1ReplicaSet,
  gvk: GroupVersionKind,
  resources: K8sResponseData,
) => {
  const obj = {
    ...rs,
    apiVersion: apiVersionForModel(gvk),
    kind: `${gvk.kind}`,
  };
  const podData = getPodsForResource(rs, resources);
  const pods = podData && podData;
  const alerts = combinePodAlerts(pods);
  return {
    alerts,
    obj,
    pods,
    revision: getDeploymentRevision(rs),
  };
};

const getIdledStatus = (
  rc: PodControllerOverviewItem,
  dc: K8sWorkloadResource,
) => {
  const { pods } = rc;
  if (pods && !pods.length && isIdled(dc)) {
    return {
      ...rc,
      pods: [
        {
          ...(rc.obj?.metadata && { metadata: rc.obj.metadata }),
          ...(rc.obj?.spec && { spec: rc.obj.spec }),
          ...(rc.obj?.status && { status: rc.obj.status }),
          status: { phase: AllPodStatus.Idle },
        },
      ],
    };
  }
  return rc;
};

const getReplicaSetsForResource = (
  deployment: K8sWorkloadResource,
  resources: K8sResponseData,
) => {
  const replicaSets = getActiveReplicaSets(deployment, resources);
  const sortReplicaSets = sortReplicaSetsByRevision(replicaSets);
  return sortReplicaSets.map((rs: V1ReplicaSet) =>
    getIdledStatus(
      toResourceItem(rs, ReplicaSetGVK, resources) as PodControllerOverviewItem,
      deployment,
    ),
  );
};

const getPodsForDeployment = (
  deployment: V1Deployment,
  resources: K8sResponseData,
): PodRCData => {
  const obj = {
    ...deployment,
  };
  const replicaSets = getReplicaSetsForResource(obj, resources);
  const [current, previous] = replicaSets;
  const isRollingOut = !!current && !!previous;

  return {
    obj,
    current: current as PodControllerOverviewItem,
    previous: previous as PodControllerOverviewItem,
    isRollingOut,
    pods: [...(current?.pods || []), ...(previous?.pods || [])] as V1Pod[],
  };
};

/**
 * Extract the resources from `getResourcesToWatchForPods` which are watched with `useK8sWatchResources`.
 */
export const getPodsDataForResource = (
  resource: K8sWorkloadResource,
  kind: string,
  resources: K8sResponseData,
): PodRCData => {
  switch (kind) {
    case 'Deployment':
      return getPodsForDeployment(resource as V1Deployment, resources);
    case 'Pod':
      return {
        obj: resource,
        isRollingOut: true,
        pods: [resource as V1Pod],
      };
    default:
      return {
        obj: resource,
        pods: getPodsForResource(resource, resources),
      };
  }
};
