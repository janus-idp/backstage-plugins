import {
  V1Deployment,
  V1Pod,
  V1ReplicaSet,
  V1Service,
} from '@kubernetes/client-node';

export type GroupVersionKind = {
  kind: string;
  apiVersion: string;
  apiGroup?: string;
};

export type K8sWorkloadResource =
  | V1Deployment
  | V1Pod
  | V1Service
  | V1ReplicaSet;

export type K8sResponseData = {
  [key: string]: { data: K8sWorkloadResource[] };
};
