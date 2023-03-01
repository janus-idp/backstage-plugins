import { ObjectsByEntityResponse } from '@backstage/plugin-kubernetes-common';
import { INSTANCE_LABEL } from '../const';
import { ModelsPlural, resourceModels } from '../models';
import { PodRCData } from '../types/pods';
import { OverviewItem, TopologyDataObject } from '../types/topology-types';
import { K8sWorkloadResource, K8sResponseData } from '../types/types';

export const WORKLOAD_TYPES: string[] = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
];

const apiVersionForWorkloadType = (type: string) => {
  return resourceModels[type]?.apiGroup
    ? `${resourceModels[type].apiGroup}/${resourceModels[type].apiVersion}`
    : resourceModels[type]?.apiVersion;
};

const workloadKind = (type: string) => {
  return resourceModels[type].kind;
};

export const getClusters = (k8sObjects: ObjectsByEntityResponse) => {
  return k8sObjects.items.map((item: any) => item.cluster.name);
};

export const getK8sResources = (
  cluster: number,
  k8sObjects: ObjectsByEntityResponse,
) =>
  k8sObjects.items?.[cluster]?.resources?.reduce(
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
  url?: string | null,
  podsData?: PodRCData,
): TopologyDataObject => {
  const dcUID = resource.metadata?.uid;
  const deploymentsLabels = resource.metadata?.labels ?? {};

  return {
    id: dcUID as string,
    name: resource?.metadata?.name || deploymentsLabels[INSTANCE_LABEL],
    type,
    resource,
    resources: {
      ...overviewItem,
    },
    data: {
      kind: resource?.kind,
      builderImage: defaultIcon,
      url,
      podsData,
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
