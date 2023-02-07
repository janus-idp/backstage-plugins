import * as _ from 'lodash';
import { OverviewItem } from '../types/topology-types';
import { K8sResourceKind } from '../types/types';
import { WORKLOAD_TYPES } from './topology-utils';

export const validPod = (pod: K8sResourceKind) => {
  const owners = pod?.metadata?.ownerReferences;
  const phase = pod?.status?.phase;
  return _.isEmpty(owners) && phase !== 'Succeeded' && phase !== 'Failed';
};

const isStandaloneJob = (job: K8sResourceKind) =>
  !_.find(job.metadata?.ownerReferences, owner => owner.kind === 'CronJob');

export const createOverviewItemForType = (
  type: string,
  resource: K8sResourceKind,
): OverviewItem | undefined => {
  if (!WORKLOAD_TYPES.includes(type)) {
    return undefined;
  }
  switch (type) {
    case 'jobs':
      return isStandaloneJob(resource)
        ? {
            obj: resource as K8sResourceKind,
          }
        : undefined;
    case 'pods':
      return validPod(resource)
        ? {
            obj: resource as K8sResourceKind,
          }
        : undefined;
    default:
      return {
        obj: resource as K8sResourceKind,
      };
  }
};
