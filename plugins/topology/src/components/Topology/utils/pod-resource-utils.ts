import * as _ from 'lodash';
import { AllPodStatus } from '../components/Pods/pod';
import { ReplicaSetModel } from '../models';
import { PodControllerOverviewItem } from '../types/pods';
import { K8sModel, K8sResourceKind } from '../types/types';

// List of container status waiting reason values that we should call out as errors in project status rows.
export const CONTAINER_WAITING_STATE_ERROR_REASONS = [
  'CrashLoopBackOff',
  'ErrImagePull',
  'ImagePullBackOff',
];

const DEPLOYMENT_REVISION_ANNOTATION = 'deployment.kubernetes.io/revision';

export const apiVersionForModel = (model: K8sModel) =>
  !model?.apiGroup ? model.apiVersion : `${model.apiGroup}/${model.apiVersion}`;

const getAnnotation = (obj: K8sResourceKind, annotation: string) => {
  return obj?.metadata?.annotations?.[annotation];
};

/**
 * check if the deployment/deploymentconfig is idled.
 * @param deploymentConfig
 */
export const isIdled = (deploymentConfig: K8sResourceKind): boolean => {
  return !!_.get(
    deploymentConfig,
    'metadata.annotations["idling.alpha.openshift.io/idled-at"]',
    false,
  );
};

export const getDeploymentRevision = (obj: any) => {
  const revision = getAnnotation(obj, DEPLOYMENT_REVISION_ANNOTATION);
  return revision && parseInt(revision, 10);
};

export const getOwnedResources = <T extends K8sResourceKind>(
  obj: K8sResourceKind,
  resources: T[],
): T[] => {
  const uid = obj?.metadata?.uid;
  if (!uid) {
    return [];
  }
  return _.filter(resources, res => {
    const ownerReferences = res.metadata?.ownerReferences;
    return _.some(ownerReferences, {
      uid,
      controller: true,
    });
  });
};

export const getActiveReplicaSets = (
  deployment: K8sResourceKind,
  resources: any,
) => {
  const { replicasets } = resources;
  const currentRevision = getDeploymentRevision(deployment);
  const ownedRS = getOwnedResources(deployment, replicasets?.data);
  return _.filter(
    ownedRS,
    rs =>
      _.get(rs, 'status.replicas') ||
      getDeploymentRevision(rs) === currentRevision,
  );
};

const sortByRevision = (
  replicators: K8sResourceKind[],
  getRevision: Function,
  descending: boolean = true,
) => {
  const compare = (left: any, right: any) => {
    const leftVersion = getRevision(left);
    const rightVersion = getRevision(right);
    if (!_.isFinite(leftVersion) && !_.isFinite(rightVersion)) {
      const leftName = _.get(left, 'metadata.name', '');
      const rightName = _.get(right, 'metadata.name', '');
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

  return _.toArray(replicators).sort(compare);
};

export const sortReplicaSetsByRevision = (
  replicaSets: K8sResourceKind[],
): K8sResourceKind[] => {
  return sortByRevision(replicaSets, getDeploymentRevision);
};

export const getPodsForResource = (
  resource: K8sResourceKind,
  resources: any,
) => {
  const { pods } = resources;
  return getOwnedResources(resource, pods?.data);
};

// Only show an alert once if multiple pods have the same error for the same owner.
const podAlertKey = (
  alert: any,
  pod: K8sResourceKind,
  containerName: string = 'all',
): string => {
  const id = _.get(pod, 'metadata.ownerReferences[0].uid', pod.metadata?.uid);
  return `${alert}--${id}--${containerName}`;
};

const getPodAlerts = (pod: K8sResourceKind) => {
  const alerts = {} as { [key: string]: any };
  const statuses = [
    ..._.get(pod, 'status.initContainerStatuses', []),
    ..._.get(pod, 'status.containerStatuses', []),
  ];
  statuses.forEach(status => {
    const { name, state } = status;
    const waitingReason = _.get(state, 'waiting.reason');
    if (CONTAINER_WAITING_STATE_ERROR_REASONS.includes(waitingReason)) {
      const key = podAlertKey(waitingReason, pod, name);
      const message = state.waiting.message || waitingReason;
      alerts[key] = { severity: 'error', message };
    }
  });

  _.get(pod, 'status.conditions', []).forEach((condition: any) => {
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

const combinePodAlerts = (pods: K8sResourceKind[]) =>
  _.reduce(
    pods,
    (acc, pod) => ({
      ...acc,
      ...getPodAlerts(pod),
    }),
    {},
  );

const toResourceItem = (
  rs: K8sResourceKind,
  model: K8sModel,
  resources: any,
) => {
  const obj = {
    ...rs,
    apiVersion: apiVersionForModel(model),
    kind: `${model.kind}`,
  };
  // const isKnative = isKnativeServing(rs, 'metadata.labels');
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

const getIdledStatus = (rc: PodControllerOverviewItem, dc: K8sResourceKind) => {
  const { pods } = rc;
  if (pods && !pods.length && isIdled(dc)) {
    return {
      ...rc,
      // FIXME: This is not a PodKind.
      pods: [
        {
          ..._.pick(rc.obj, 'metadata', 'status', 'spec'),
          status: { phase: AllPodStatus.Idle },
        },
      ],
    };
  }
  return rc;
};

export const getReplicaSetsForResource = (
  deployment: K8sResourceKind,
  resources: any,
): PodControllerOverviewItem[] => {
  const replicaSets = getActiveReplicaSets(deployment, resources);
  return sortReplicaSetsByRevision(replicaSets as K8sResourceKind[]).map(
    (rs: K8sResourceKind) =>
      getIdledStatus(
        toResourceItem(
          rs,
          ReplicaSetModel,
          resources,
        ) as PodControllerOverviewItem,
        deployment,
      ),
  );
};

export const getPodsForDeployment = (
  deployment: K8sResourceKind,
  resources: any,
) => {
  const obj = {
    ...deployment,
  };
  const replicaSets = getReplicaSetsForResource(obj, resources);
  const [current, previous] = replicaSets;
  const isRollingOut = !!current && !!previous;

  return {
    obj,
    current,
    previous,
    isRollingOut,
    pods: [...(current?.pods || []), ...(previous?.pods || [])],
  };
};

/**
 * Extract the resources from `getResourcesToWatchForPods` which are watched with `useK8sWatchResources`.
 */
export const getPodsDataForResource = (
  resource: K8sResourceKind,
  kind: string | undefined,
  resources: any,
) => {
  switch (kind) {
    case 'Deployment':
      return getPodsForDeployment(resource, resources);
    case 'Pod':
      return {
        obj: resource,
        current: undefined,
        previous: undefined,
        isRollingOut: true,
        pods: [resource],
      };
    default:
      return {
        obj: resource,
        current: undefined,
        previous: undefined,
        isRollingOut: undefined,
        pods: getPodsForResource(resource, resources),
      };
  }
};

/**
 * Return a `WatchK8sResources` object for `useK8sWatchResources` to get all related `Pods`
 * for a given kind and namespace.
 *
 * - It watches for all `Pods` and all `ReplicationControllers` for a `DeploymentConfig`
 * - It watches for all `Pods` and all `ReplicaSets` for a `Deployment`
 * - It watches for all `Pods` and all `StatefulSets` for a `StatefulSet`
 * - It watches for all `Pods` and all `Jobs` for a `CronJob`
 * - And it watches for all `Pods` for all other kinds, or when no kind is provided.
 *
 * See also `getPodsDataForResource` above
 */
export const getResourcesToWatchForPods = (kind: string, namespace: string) => {
  if (kind && kind === 'Deployment') {
    return {
      pods: {
        isList: true,
        kind: 'Pod',
        namespace,
      },
      replicasets: {
        isList: true,
        kind: 'ReplicaSet',
        namespace,
      },
    };
  }

  return {
    pods: {
      isList: true,
      kind: 'Pod',
      namespace,
    },
  };
};
