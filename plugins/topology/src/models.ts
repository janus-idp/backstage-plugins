import { GroupVersionKind } from './types/types';

export const ReplicaSetGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'apps',
  kind: 'ReplicaSet',
};

export const PodGVK: GroupVersionKind = {
  apiVersion: 'v1',
  kind: 'Pod',
};

export const DeploymentGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'apps',
  kind: 'Deployment',
};

export const ServiceGVK: GroupVersionKind = {
  apiVersion: 'v1',
  kind: 'Service',
};

export const IngressesGVK: GroupVersionKind = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
};

export const DaemonSetGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'apps',
  kind: 'DaemonSet',
};

export const StatefulSetGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'apps',
  kind: 'StatefulSet',
};

export const JobGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'batch',
  kind: 'Job',
};

export const CronJobGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'batch',
  kind: 'CronJob',
};

export enum ModelsPlural {
  deployments = 'deployments',
  pods = 'pods',
  replicasets = 'replicasets',
  services = 'services',
  ingresses = 'ingresses',
  jobs = 'jobs',
  daemonsets = 'daemonsets',
  cronjobs = 'cronjobs',
  statefulsets = 'statefulsets',
}

export const resourceGVKs: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.deployments]: DeploymentGVK,
  [ModelsPlural.pods]: PodGVK,
  [ModelsPlural.replicasets]: ReplicaSetGVK,
  [ModelsPlural.services]: ServiceGVK,
  [ModelsPlural.ingresses]: IngressesGVK,
  [ModelsPlural.daemonsets]: DaemonSetGVK,
  [ModelsPlural.cronjobs]: CronJobGVK,
  [ModelsPlural.jobs]: JobGVK,
  [ModelsPlural.statefulsets]: StatefulSetGVK,
};

export const DeploymentModel = {
  ...DeploymentGVK,
  abbr: 'D',
  labelPlural: 'Deployments',
};

export const PodModel = {
  ...PodGVK,
  abbr: 'P',
  labelPlural: 'Pods',
};

export const ServiceModel = {
  ...ServiceGVK,
  abbr: 'S',
  labelPlural: 'Services',
};

export const IngressModel = {
  ...IngressesGVK,
  labelPlural: 'Ingresses',
  abbr: 'I',
};

export const DaemonSetModel = {
  ...DaemonSetGVK,
  abbr: 'DS',
  labelPlural: 'DaemonSets',
};

export const StatefulSetModel = {
  ...StatefulSetGVK,
  abbr: 'SS',
  labelPlural: 'StatefulSets',
};

export const CronJobModel = {
  ...CronJobGVK,
  abbr: 'CJ',
  labelPlural: 'CronJobs',
};

export const JobModel = {
  ...JobGVK,
  abbr: 'J',
  labelPlural: 'Jobs',
};

export const resourceModels = {
  [DeploymentModel.kind]: DeploymentModel,
  [PodModel.kind]: PodModel,
  [ServiceModel.kind]: ServiceModel,
  [IngressModel.kind]: IngressModel,
  [StatefulSetModel.kind]: StatefulSetModel,
  [DaemonSetModel.kind]: DaemonSetModel,
  [CronJobModel.kind]: CronJobModel,
  [JobModel.kind]: JobModel,
};
