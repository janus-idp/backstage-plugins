import * as _ from 'lodash';
import { resourceModels } from '../models';
import {
  KindsMap,
  OverviewItem,
  TopologyDataObject,
  TopologyDataResources,
  TopologyResourcesObject,
} from '../types/topology-types';
import {
  K8sResourceKind,
  WatchedResourceType,
  WatchK8sResults,
} from '../types/types';

export const WORKLOAD_TYPES = ['deployments', 'jobs', 'pods'];

export const getTopologyResourceObject = (
  topologyObject: TopologyDataObject,
): K8sResourceKind | null => {
  if (!topologyObject) {
    return null;
  }
  return topologyObject.resource || topologyObject.resources?.obj;
};

export const isGroupVersionKind = (ref: string) => ref.split('~').length === 3;

export const kindForReference = (ref: string) =>
  isGroupVersionKind(ref) ? ref.split('~')[2] : ref;

export const apiVersionForReference = (ref: string) =>
  isGroupVersionKind(ref) ? `${ref.split('~')[0]}/${ref.split('~')[1]}` : ref;

export const groupVersionFor = (apiVersion: string) => ({
  group: apiVersion.split('/').length === 2 ? apiVersion.split('/')[0] : 'core',
  version:
    apiVersion.split('/').length === 2 ? apiVersion.split('/')[1] : apiVersion,
});

export const apiVersionForWorkloadType = (type: string) => {
  return resourceModels[type]?.apiGroup
    ? `${resourceModels[type].apiGroup}/${resourceModels[type].apiVersion}`
    : resourceModels[type]?.apiVersion;
};

export const workloadKind = (type: string) => {
  return resourceModels[type].kind;
};

export const getResources = (k8sObjects: any) =>
  k8sObjects.items[0].resources.reduce(
    (acc: WatchK8sResults<TopologyResourcesObject>, res: any) => ({
      ...acc,
      [res.type]: {
        data: res.resources.map((rval: K8sResourceKind) => ({
          ...rval,
          kind: workloadKind(res.type),
          apiVersion: apiVersionForWorkloadType(res.type),
        })),
        loaded: true,
        loadError: '',
      },
    }),
    {},
  );

type DeploymentLablesAnnotations = {
  [key: string]: string;
};
/**
 * create all data that need to be shown on a topology data
 */
export const createTopologyNodeData = (
  resource: K8sResourceKind,
  overviewItem: OverviewItem,
  type: string,
  defaultIcon: string,
) => {
  const dcUID = _.get(resource, 'metadata.uid');
  const deploymentsLabels = _.get(
    resource,
    'metadata.labels',
    {},
  ) as DeploymentLablesAnnotations;
  const deploymentsAnnotations = _.get(
    resource,
    'metadata.annotations',
    {},
  ) as DeploymentLablesAnnotations;

  const { group, version } = groupVersionFor(resource.apiVersion as string);
  const kindRef = [group || 'core', version, resource.kind].join('~');
  return {
    id: dcUID,
    name:
      resource?.metadata?.name ||
      deploymentsLabels['app.kubernetes.io/instance'],
    type,
    resource,
    resources: {
      ...overviewItem,
    },
    data: {
      kind: kindRef,
      editURL: deploymentsAnnotations['app.openshift.io/edit-url'],
      vcsURI: deploymentsAnnotations['app.openshift.io/vcs-uri'],
      vcsRef: deploymentsAnnotations['app.openshift.io/vcs-ref'],
      builderImage: defaultIcon,
    },
  };
};

export const getWorkloadResources2 = (
  resources: TopologyDataResources,
  kindsMap: KindsMap,
  workloadTypes: string[] = WORKLOAD_TYPES,
) => {
  return _.flatten(
    workloadTypes.map(resourceKind => {
      return resources[resourceKind]
        ? resources[resourceKind].data.map(res => {
            const resKind = res.kind || kindsMap[resourceKind];
            let kind = resKind;
            let apiVersion = apiVersionForWorkloadType(resourceKind);
            if (resKind && isGroupVersionKind(resKind)) {
              kind = kindForReference(resKind);
              apiVersion = apiVersionForReference(resKind);
            }
            return {
              kind,
              apiVersion,
              ...res,
            };
          })
        : [];
    }),
  );
};

export const getWorkloadResources = (
  resources: TopologyDataResources,
  resList: WatchedResourceType,
): K8sResourceKind[] => {
  const workloadKeys = [...WORKLOAD_TYPES];
  const kindsMap = Object.keys(resList).reduce((acc: KindsMap, key) => {
    acc[key] = resList[key].kind;
    return acc;
  }, {});
  return getWorkloadResources2(resources, kindsMap, workloadKeys);
};
