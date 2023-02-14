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

export enum ModelsPlural {
  deployments = 'deployments',
  pods = 'pods',
  replicasets = 'replicasets',
  services = 'services',
}

export const resourceModels: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.deployments]: DeploymentGVK,
  [ModelsPlural.pods]: PodGVK,
  [ModelsPlural.replicasets]: ReplicaSetGVK,
  [ModelsPlural.services]: ServiceGVK,
};
