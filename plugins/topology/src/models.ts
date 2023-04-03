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

export const resourceModels: { [key: string]: GroupVersionKind } = {
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
  label: 'Deployment',
  labelKey: 'Deployment',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  id: 'deployment',
  labelPlural: 'Deployments',
  labelPluralKey: 'Deployments',
};

export const PodModel = {
  ...PodGVK,
  label: 'Pod',
  labelKey: 'Pod',
  plural: 'pods',
  abbr: 'P',
  namespaced: true,
  id: 'pod',
  labelPlural: 'Pods',
  labelPluralKey: 'Pods',
};

export const ServiceModel = {
  ...ServiceGVK,
  label: 'Service',
  labelKey: 'Service',
  plural: 'services',
  abbr: 'S',
  namespaced: true,
  id: 'service',
  labelPlural: 'Services',
  labelPluralKey: 'Services',
};

export const IngressModel = {
  ...IngressesGVK,
  label: 'Ingress',
  labelKey: 'Ingress',
  labelPlural: 'Ingresses',
  labelPluralKey: 'Ingresses',
  plural: 'ingresses',
  abbr: 'I',
  namespaced: true,
  id: 'ingress',
};

export const models = {
  [DeploymentModel.kind]: DeploymentModel,
  [PodModel.kind]: PodModel,
  [ServiceModel.kind]: ServiceModel,
  [IngressModel.kind]: IngressModel,
};
