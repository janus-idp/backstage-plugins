import {
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1IngressRule,
  V1Job,
  V1Pod,
  V1ReplicaSet,
  V1Service,
  V1StatefulSet,
} from '@kubernetes/client-node';

export type GroupVersionKind = {
  kind: string;
  apiVersion: string;
  apiGroup?: string;
};

export type Model = GroupVersionKind & {
  abbr: string;
  labelPlural: string;
  color?: string;
  plural?: string;
};

export type K8sWorkloadResource =
  | V1Deployment
  | V1Pod
  | V1Service
  | V1ReplicaSet
  | V1CronJob
  | V1DaemonSet
  | V1Job
  | V1StatefulSet;

export type K8sResponseData = {
  [key: string]: { data: K8sWorkloadResource[] };
};

export type IngressRule = {
  schema: string;
  rules: V1IngressRule[];
};

export type ClusterError = {
  errorType?: string;
  message?: string;
  resourcePath?: string;
  statusCode?: number;
};

export type ClusterErrors = ClusterError[];

export type K8sResourcesContextData = {
  watchResourcesData?: K8sResponseData;
  loading?: boolean;
  responseError?: string;
  selectedClusterErrors?: ClusterErrors;
  clusters: string[];
  setSelectedCluster: React.Dispatch<React.SetStateAction<number>>;
};
