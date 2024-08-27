import {
  PipelineGVK,
  PipelineModel,
  ModelsPlural as PipelineModelsPlural,
  PipelineRunGVK,
  PipelineRunModel,
  TaskRunGVK,
  TaskRunModel,
} from './pipeline-models';
import { GroupVersionKind, Model } from './types/types';
import {
  // ReplicationControllerGVK,
  VirtualMachineGVK,
  VirtualMachineInstanceGVK,
  VirtualMachineInstanceModel,
  VirtualMachineModel,
} from './vm-models';

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

export const RouteGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'route.openshift.io',
  kind: 'Route',
};

export const CheClusterGVK: GroupVersionKind = {
  apiVersion: 'v2',
  apiGroup: 'org.eclipse.che',
  kind: 'CheCluster',
};
export const TemplateGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'template.openshift.io',
  kind: 'Template',
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
  routes = 'routes',
  pipelines = 'pipelines',
  pipelineruns = 'pipelineruns',
  checlusters = 'checlusters',
  virtualmachines = 'virtualmachines',
  virtualmachineinstances = 'virtualmachineinstances',
  // replicationcontrollers = 'replicationcontrollers',
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
  [ModelsPlural.routes]: RouteGVK,
  [PipelineModelsPlural.pipelineruns]: PipelineRunGVK,
  [PipelineModelsPlural.pipelines]: PipelineGVK,
  [PipelineModelsPlural.taskruns]: TaskRunGVK,
  [ModelsPlural.checlusters]: CheClusterGVK,
  [ModelsPlural.virtualmachines]: VirtualMachineGVK,
  [ModelsPlural.virtualmachineinstances]: VirtualMachineInstanceGVK,
  // [ModelsPlural.replicationcontrollers]: ReplicationControllerGVK,
};

export const DeploymentModel: Model = {
  ...DeploymentGVK,
  abbr: 'D',
  labelPlural: 'Deployments',
  color: '#004080',
};

export const PodModel: Model = {
  ...PodGVK,
  abbr: 'P',
  labelPlural: 'Pods',
  color: '#009596',
};

export const ServiceModel: Model = {
  ...ServiceGVK,
  abbr: 'S',
  labelPlural: 'Services',
  color: '#6ca100',
};

export const IngressModel: Model = {
  ...IngressesGVK,
  labelPlural: 'Ingresses',
  abbr: 'I',
};

export const DaemonSetModel: Model = {
  ...DaemonSetGVK,
  abbr: 'DS',
  labelPlural: 'DaemonSets',
  color: '#004080',
};

export const StatefulSetModel: Model = {
  ...StatefulSetGVK,
  abbr: 'SS',
  labelPlural: 'StatefulSets',
};

export const CronJobModel: Model = {
  ...CronJobGVK,
  abbr: 'CJ',
  labelPlural: 'CronJobs',
};

export const JobModel: Model = {
  ...JobGVK,
  abbr: 'J',
  labelPlural: 'Jobs',
  color: '#004080',
};

export const RouteModel: Model = {
  ...RouteGVK,
  abbr: 'RT',
  labelPlural: 'Routes',
  plural: 'routes',
  color: '#2b9af3',
};

export const CheClusterModel: Model = {
  ...CheClusterGVK,
  abbr: 'CC',
  labelPlural: 'CheClusters',
  plural: 'checlusters',
};

export const TemplateModel: Model = {
  ...TemplateGVK,
  plural: 'templates',
  abbr: 'T',
  labelPlural: 'Templates',
  color: '#2b9af3',
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
  [RouteModel.kind]: RouteModel,
  [PipelineModel.kind]: PipelineModel,
  [PipelineRunModel.kind]: PipelineRunModel,
  [TaskRunModel.kind]: TaskRunModel,
  [CheClusterModel.kind]: CheClusterModel,
  [VirtualMachineModel.kind]: VirtualMachineModel,
  [VirtualMachineInstanceModel.kind]: VirtualMachineInstanceModel,
  [TemplateModel.kind]: TemplateModel,
};
