import { Model, NodeModel } from '@patternfly/react-topology';
import { TYPE_APPLICATION_GROUP } from '../const';
import { TopologyDataResources } from '../types/topology-types';
import { K8sResourceKind } from '../types/types';
import { createOverviewItemForType } from '../utils/resource-utils';
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

const TYPE_WORKLOAD = 'workload';

const getBaseTopologyDataModel = (resources: TopologyDataResources): Model => {
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

      resources[key].data.forEach(resource => {
        const item = createOverviewItemForType(
          key,
          resource as K8sResourceKind,
        );
        if (item) {
          const data = createTopologyNodeData(
            resource as K8sResourceKind,
            item,
            TYPE_WORKLOAD,
            'default image',
          );
          typedDataModel.nodes?.push(
            getTopologyNodeItem(
              resource as K8sResourceKind,
              TYPE_WORKLOAD,
              data,
              WorkloadModelProps,
            ),
          );
          mergeGroup(
            getTopologyGroupItems(resource as K8sResourceKind) as NodeModel,
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
  workloadResources: K8sResourceKind[],
) => {
  // Create all visual connectors
  workloadResources.forEach(dc => {
    model.edges?.push(...getTopologyEdgeItems(dc, workloadResources));
  });
};

export const baseDataModelGetter = (
  model: Model,
  resources: TopologyDataResources,
  workloadResources: K8sResourceKind[],
): Model => {
  const baseModel = getBaseTopologyDataModel(resources);
  addToTopologyDataModel(baseModel, model);

  updateAppGroupChildren(model);
  createVisualConnectors(model, workloadResources);

  return model;
};
