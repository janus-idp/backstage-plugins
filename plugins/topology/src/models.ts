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

export enum ModelsPlural {
  deployments = 'deployments',
  pods = 'pods',
  replicasets = 'replicasets',
  services = 'services',
  ingresses = 'ingresses',
}

export const resourceModels: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.deployments]: DeploymentGVK,
  [ModelsPlural.pods]: PodGVK,
  [ModelsPlural.replicasets]: ReplicaSetGVK,
  [ModelsPlural.services]: ServiceGVK,
  [ModelsPlural.ingresses]: IngressesGVK,
};
