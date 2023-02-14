import { V1Pod } from '@kubernetes/client-node';
import { OverviewItem } from '../types/topology-types';
import { K8sWorkloadResource } from '../types/types';
import { WORKLOAD_TYPES } from './topology-utils';

const validPod = (pod: V1Pod) => {
  const owners = pod?.metadata?.ownerReferences;
  const phase = pod?.status?.phase;
  return (
    (!owners || Object.keys(owners).length === 0) &&
    phase !== 'Succeeded' &&
    phase !== 'Failed'
  );
};

const isStandaloneJob = (job: K8sWorkloadResource) =>
  job.metadata?.ownerReferences?.find(owner => owner.kind === 'CronJob');

export const createOverviewItemForType = (
  type: string,
  resource: K8sWorkloadResource,
): OverviewItem | undefined => {
  if (!WORKLOAD_TYPES.includes(type)) {
    return undefined;
  }
  switch (type) {
    case 'jobs':
      return isStandaloneJob(resource)
        ? {
            obj: resource as K8sWorkloadResource,
          }
        : undefined;
    case 'pods':
      return validPod(resource as V1Pod)
        ? {
            obj: resource as K8sWorkloadResource,
          }
        : undefined;
    default:
      return {
        obj: resource as K8sWorkloadResource,
      };
  }
};
