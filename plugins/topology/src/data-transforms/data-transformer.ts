import { V1Service } from '@kubernetes/client-node';
import { Model, NodeModel } from '@patternfly/react-topology';

import { TYPE_APPLICATION_GROUP, TYPE_WORKLOAD } from '../const';
import { CronJobModel } from '../models';
import { K8sResponseData, K8sWorkloadResource } from '../types/types';
import { getPodsDataForResource } from '../utils/pod-resource-utils';
import {
  createOverviewItemForType,
  getIngressesDataForResourceServices,
  getJobsDataForResource,
  getRoutesDataForResourceServices,
  getServicesForResource,
  getUrlForResource,
} from '../utils/resource-utils';
import {
  createTopologyNodeData,
  WORKLOAD_TYPES,
} from '../utils/topology-utils';
import {
  addToTopologyDataModel,
  getTopologyEdgeItems,
  getTopologyGroupItems,
  getTopologyNodeItem,
  mergeGroup,
  WorkloadModelProps,
} from '../utils/transform-utils';

export const getBaseTopologyDataModel = (resources: K8sResponseData): Model => {
  const baseDataModel: Model = {
    nodes: [],
    edges: [],
  };

  WORKLOAD_TYPES.forEach((key: string) => {
    if (resources?.[key]?.data?.length) {
      const typedDataModel: Model = {
        nodes: [],
        edges: [],
      };

      resources[key].data.forEach((resource: K8sWorkloadResource) => {
        const item = createOverviewItemForType(key, resource);
        if (item) {
          const data = createTopologyNodeData(
            resource,
            item,
            TYPE_WORKLOAD,
            'default image',
            getUrlForResource(resources, resource),
            {
              podsData: getPodsDataForResource(resource, resources),
              services: getServicesForResource(
                resource,
                resources.services?.data as V1Service[],
              ),
              ingressesData: getIngressesDataForResourceServices(
                resources,
                resource,
              ),
              routesData: getRoutesDataForResourceServices(resources, resource),
              ...(resource.kind === CronJobModel.kind
                ? {
                    jobsData: getJobsDataForResource(resources, resource),
                  }
                : {}),
            },
          );
          typedDataModel.nodes?.push(
            getTopologyNodeItem(
              resource,
              TYPE_WORKLOAD,
              data,
              WorkloadModelProps,
            ),
          );
          mergeGroup(
            getTopologyGroupItems(resource) as NodeModel,
            typedDataModel.nodes as NodeModel[],
          );
        }
      });
      addToTopologyDataModel(typedDataModel, baseDataModel);
    }
  });

  return baseDataModel;
};

const updateAppGroupChildren = (model: Model) => {
  model.nodes?.forEach(n => {
    if (n.type === TYPE_APPLICATION_GROUP) {
      // Filter out any children removed by depicters
      n.children = n.children?.filter(id =>
        model.nodes?.find(child => child.id === id),
      );
      n.data.groupResources =
        n.children?.map(id => model.nodes?.find(c => id === c.id)) ?? [];
    }
  });

  // Remove any empty groups
  model.nodes = model.nodes?.filter(
    n =>
      n.type !== TYPE_APPLICATION_GROUP ||
      (n.children?.length && n.children?.length > 0),
  );
};

const createVisualConnectors = (
  model: Model,
  workloadResources: K8sWorkloadResource[],
) => {
  // Create all visual connectors
  workloadResources.forEach(dc => {
    model.edges?.push(...getTopologyEdgeItems(dc, workloadResources));
  });
};

export const baseDataModelGetter = (
  model: Model,
  resources: K8sResponseData,
  workloadResources: K8sWorkloadResource[],
): Model => {
  const baseModel = getBaseTopologyDataModel(resources);
  addToTopologyDataModel(baseModel, model);

  updateAppGroupChildren(model);
  createVisualConnectors(model, workloadResources);

  return model;
};
