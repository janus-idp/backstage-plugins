import { ObjectsByEntityResponse } from '@backstage/plugin-kubernetes-common';

import { V1Service } from '@kubernetes/client-node';

import { INSTANCE_LABEL } from '../const';
import { ModelsPlural, resourceGVKs, resourceModels } from '../models';
import { IngressesData } from '../types/ingresses';
import { JobsData } from '../types/jobs';
import { PipelinesData } from '../types/pipelineRun';
import { PodRCData } from '../types/pods';
import { RoutesData } from '../types/route';
import { OverviewItem, TopologyDataObject } from '../types/topology-types';
import {
  ClusterErrors,
  K8sResponseData,
  K8sWorkloadResource,
} from '../types/types';

export const WORKLOAD_TYPES: string[] = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
  ModelsPlural.cronjobs,
  ModelsPlural.jobs,
  ModelsPlural.statefulsets,
  ModelsPlural.daemonsets,
];

const apiVersionForWorkloadType = (type: string) => {
  return resourceGVKs[type]?.apiGroup
    ? `${resourceGVKs[type].apiGroup}/${resourceGVKs[type].apiVersion}`
    : resourceGVKs[type]?.apiVersion;
};

const workloadKind = (type: string) => {
  return resourceGVKs[type].kind;
};

export const getClusters = (k8sObjects: ObjectsByEntityResponse) => {
  const clusters: string[] = k8sObjects.items.map(
    (item: any) => item.cluster.name,
  );
  const errors: ClusterErrors[] = k8sObjects.items.map(
    (item: any) => item.errors,
  );
  return { clusters, errors };
};

export const getCustomResourceKind = (resource: any): string => {
  if (resource.kind) {
    return resource.kind;
  }

  if (resource.spec.host && resource.status.ingress) {
    return 'Route';
  }
  return '';
};

export const getK8sResources = (
  cluster: number,
  k8sObjects: ObjectsByEntityResponse,
) =>
  k8sObjects.items?.[cluster]?.resources?.reduce(
    (acc: K8sResponseData, res: any) => {
      if (res.type === 'customresources' && res.resources.length > 0) {
        const customResKind = getCustomResourceKind(res.resources[0]);
        const customResKnownModel = resourceModels[customResKind];
        return customResKnownModel?.plural
          ? {
              ...acc,
              [customResKnownModel.plural]: {
                data: res.resources.map((rval: K8sWorkloadResource) => ({
                  ...rval,
                  kind: customResKind,
                  apiVersion: apiVersionForWorkloadType(customResKind),
                })),
              },
            }
          : acc;
      }
      return {
        ...acc,
        [res.type]: {
          data:
            (resourceGVKs[res.type] &&
              res.resources.map((rval: K8sWorkloadResource) => ({
                ...rval,
                kind: workloadKind(res.type),
                apiVersion: apiVersionForWorkloadType(res.type),
              }))) ??
            [],
        },
      };
    },
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
  resourcesData?: {
    podsData?: PodRCData;
    services?: V1Service[];
    ingressesData?: IngressesData;
    jobsData?: JobsData;
    routesData?: RoutesData;
    pipelinesData?: PipelinesData;
  },
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
      ...resourcesData,
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
