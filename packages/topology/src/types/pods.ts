import { V1Pod } from '@kubernetes/client-node';

import { K8sWorkloadResource } from './types';

export type OverviewItemAlerts = {
  [key: string]: {
    message: string;
    severity: string;
  };
};

export type PodControllerOverviewItem = {
  alerts?: OverviewItemAlerts;
  revision?: number;
  obj?: K8sWorkloadResource;
  phase?: string;
  pods?: V1Pod[];
};

export type PodRCData = {
  current?: PodControllerOverviewItem;
  previous?: PodControllerOverviewItem;
  obj: K8sWorkloadResource;
  isRollingOut?: boolean;
  pods: V1Pod[];
};
