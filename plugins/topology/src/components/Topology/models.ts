import { K8sModel } from './types/types';

export const ReplicaSetModel: K8sModel = {
  label: 'ReplicaSet',
  apiVersion: 'v1',
  apiGroup: 'apps',
  plural: 'replicasets',
  abbr: 'RS',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'ReplicaSet',
  id: 'replicaset',
  labelPlural: 'ReplicaSets',
};

export const PodModel: K8sModel = {
  apiVersion: 'v1',
  label: 'Pod',
  plural: 'pods',
  abbr: 'P',
  namespaced: true,
  kind: 'Pod',
  id: 'pod',
  labelPlural: 'Pods',
};

export const DeploymentModel: K8sModel = {
  label: 'Deployment',
  apiVersion: 'v1',
  apiGroup: 'apps',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Deployment',
  id: 'deployment',
  labelPlural: 'Deployments',
};
