import { ObjectsByEntityResponse } from '@backstage/plugin-kubernetes-common';
import { INSTANCE_LABEL } from '../const';
import { ModelsPlural, resourceModels } from '../models';
import { OverviewItem, TopologyDataObject } from '../types/topology-types';
import { K8sWorkloadResource, K8sResponseData } from '../types/types';

export const WORKLOAD_TYPES: string[] = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
];

export const getTopologyResourceObject = (
  topologyObject: TopologyDataObject,
): K8sWorkloadResource => {
  return topologyObject?.resource || topologyObject?.resources?.obj;
};

const apiVersionForWorkloadType = (type: string) => {
  return resourceModels[type]?.apiGroup
    ? `${resourceModels[type].apiGroup}/${resourceModels[type].apiVersion}`
    : resourceModels[type]?.apiVersion;
};

const workloadKind = (type: string) => {
  return resourceModels[type].kind;
};

export const getK8sResources = (
  k8sObjects: ObjectsByEntityResponse,
): K8sResponseData =>
  k8sObjects.items?.[0]?.resources?.reduce(
    (acc: K8sResponseData, res: any) => ({
      ...acc,
      [res.type]: {
        data:
          (resourceModels[res.type] &&
            res.resources.map((rval: K8sWorkloadResource) => ({
              ...rval,
              kind: workloadKind(res.type),
              apiVersion: apiVersionForWorkloadType(res.type),
            }))) ??
          [],
      },
    }),
    {},
  );

/**
 * create all data that need to be shown on a topology data
 */
export const createTopologyNodeData = (
  resource: K8sWorkloadResource,
  overviewItem: OverviewItem,
  type: string,
  defaultIcon: string,
) => {
  const dcUID = resource.metadata?.uid;
  const deploymentsLabels = resource.metadata?.labels ?? {};

  return {
    id: dcUID,
    name: resource?.metadata?.name || deploymentsLabels[INSTANCE_LABEL],
    type,
    resource,
    resources: {
      ...overviewItem,
    },
    data: {
      kind: resource?.kind,
      builderImage: defaultIcon,
    },
  };
};

export const getWorkloadResources = (resources: K8sResponseData) => {
  const workloadTypes = [...WORKLOAD_TYPES];
  const workloadRes = workloadTypes
    .map(resourceKind => {
      return resources[resourceKind]
        ? resources[resourceKind]?.data.map(res => {
            const kind = res.kind;
            const apiVersion = res.apiVersion;
            return {
              kind,
              apiVersion,
              ...res,
            };
          })
        : [];
    })
    .flat();
  return workloadRes;
};
