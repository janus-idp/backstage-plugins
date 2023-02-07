import {
  EdgeModel,
  Model,
  NodeModel,
  NodeShape,
} from '@patternfly/react-topology';
import * as _ from 'lodash';
import {
  GROUP_HEIGHT,
  GROUP_PADDING,
  GROUP_WIDTH,
  NODE_HEIGHT,
  NODE_PADDING,
  NODE_WIDTH,
  TYPE_APPLICATION_GROUP,
  TYPE_CONNECTS_TO,
} from '../const';
import {
  OdcNodeModel,
  TopologyDataModelDepicted,
} from '../types/topology-types';
import { K8sResourceKind } from '../types/types';
import { groupVersionFor } from './topology-utils';

export type ConnectsToData = { apiVersion: string; kind: string; name: string };

export const WorkloadModelProps = {
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  group: false,
  visible: true,
  style: {
    padding: NODE_PADDING,
  },
};

/**
 * create node data for graphs
 */
export const getTopologyNodeItem = (
  resource: K8sResourceKind,
  type: string,
  data: any,
  nodeProps?: Omit<OdcNodeModel, 'type' | 'data' | 'children' | 'id' | 'label'>,
  children?: string[],
  resourceKind?: string,
  shape?: NodeShape,
): OdcNodeModel => {
  const uid = resource.metadata?.uid;
  const name = resource.metadata?.name;
  const label = resource.metadata?.labels?.['app.openshift.io/instance'];
  const { group, version } = groupVersionFor(resource.apiVersion as string);
  const kindRef = [group || 'core', version, resource.kind].join('~');
  const kind = resourceKind || kindRef;
  return {
    id: uid as string,
    type,
    label: label || name,
    shape,
    resource,
    resourceKind: kind,
    data,
    ...(children && children.length && { children }),
    ...(nodeProps || {}),
  };
};

/**
 * create groups data for graph
 */
export const getTopologyGroupItems = (
  dc: K8sResourceKind,
): NodeModel | null => {
  const groupName = _.get(dc, [
    'metadata',
    'labels',
    'app.kubernetes.io/part-of',
  ]);
  if (!groupName) {
    return null;
  }

  return {
    id: `group:${groupName}`,
    type: TYPE_APPLICATION_GROUP,
    group: true,
    label: groupName,
    children: [_.get(dc, ['metadata', 'uid'])],
    width: GROUP_WIDTH,
    height: GROUP_HEIGHT,
    data: {},
    visible: true,
    collapsed: false,
    style: {
      padding: GROUP_PADDING,
    },
  };
};

const mergeGroupData = (
  newGroup: NodeModel,
  existingGroup: NodeModel,
): void => {
  if (!existingGroup.data?.groupResources && !newGroup.data?.groupResources) {
    return;
  }

  if (!existingGroup.data?.groupResources) {
    existingGroup.data.groupResources = [];
  }
  if (newGroup?.data?.groupResources) {
    newGroup.data.groupResources.forEach((obj: any) => {
      if (!existingGroup.data.groupResources.includes(obj)) {
        existingGroup.data.groupResources.push(obj);
      }
    });
  }
};

export const mergeGroup = (
  newGroup: NodeModel,
  existingGroups: NodeModel[],
): void => {
  if (!newGroup) {
    return;
  }

  // Remove any children from the new group that already belong to another group
  newGroup.children = newGroup.children?.filter(
    c => !existingGroups?.find(g => g.children?.includes(c)),
  );

  // find and add the groups
  const existingGroup = existingGroups.find(
    g => g.group && g.id === newGroup.id,
  );
  if (!existingGroup) {
    existingGroups.push(newGroup);
  } else {
    newGroup.children?.forEach(id => {
      if (!existingGroup.children?.includes(id)) {
        existingGroup.children?.push(id);
      }
      mergeGroupData(newGroup, existingGroup);
    });
  }
};

export const mergeGroups = (
  newGroups: NodeModel[],
  existingGroups: NodeModel[],
): void => {
  if (!newGroups || !newGroups.length) {
    return;
  }
  newGroups.forEach(newGroup => {
    mergeGroup(newGroup, existingGroups);
  });
};

export const addToTopologyDataModel = (
  newModel: Model,
  graphModel: Model,
  dataModelDepicters: TopologyDataModelDepicted[] = [],
) => {
  if (newModel?.edges && graphModel.edges) {
    graphModel.edges.push(...newModel.edges);
  }
  if (newModel?.nodes && graphModel.nodes) {
    graphModel.nodes.push(
      ...newModel.nodes.filter(
        n =>
          !n.group &&
          !graphModel.nodes?.find(existing => {
            if (n.id === existing.id) {
              return true;
            }
            const { resource } = n as OdcNodeModel;
            return (
              !resource ||
              !!dataModelDepicters.find(depicter =>
                depicter(resource, graphModel),
              )
            );
          }),
      ),
    );
    mergeGroups(
      newModel.nodes.filter(n => n.group),
      graphModel.nodes,
    );
  }
};

export const edgesFromAnnotations = (
  annotations: any,
): (string | ConnectsToData)[] => {
  let edges: (string | ConnectsToData)[] = [];
  if (_.has(annotations, ['app.openshift.io/connects-to'])) {
    try {
      edges = JSON.parse(annotations['app.openshift.io/connects-to']);
    } catch (e) {
      // connects-to annotation should hold a JSON string value but failed to parse
      // treat value as a comma separated list of strings
      edges = annotations['app.openshift.io/connects-to']
        .split(',')
        .map((v: any) => v.trim());
    }
  }

  return edges;
};

/**
 * create edge data for graph
 */
export const getTopologyEdgeItems = (
  dc: K8sResourceKind,
  resources: K8sResourceKind[],
): EdgeModel[] => {
  const annotations = _.get(dc, 'metadata.annotations');
  const edges: EdgeModel[] = [];

  _.forEach(
    edgesFromAnnotations(annotations),
    (edge: string | ConnectsToData) => {
      // handles multiple edges
      const targetNode = _.get(
        _.find(resources, deployment => {
          let name;
          if (typeof edge === 'string') {
            name =
              deployment.metadata?.labels?.['app.kubernetes.io/instance'] ??
              deployment.metadata?.name;
            return name === edge;
          }
          name = deployment.metadata?.name;
          const {
            apiVersion: edgeApiVersion,
            kind: edgeKind,
            name: edgeName,
          } = edge;
          const { kind, apiVersion } = deployment;
          let edgeExists = name === edgeName && kind === edgeKind;
          if (apiVersion) {
            edgeExists = edgeExists && apiVersion === edgeApiVersion;
          }
          return edgeExists;
        }),
        ['metadata', 'uid'],
      );
      const uid = _.get(dc, ['metadata', 'uid']);
      if (targetNode) {
        edges.push({
          id: `${uid}_${targetNode}`,
          type: TYPE_CONNECTS_TO,
          label: 'Visual connector',
          source: uid,
          target: targetNode,
        });
      }
    },
  );

  return edges;
};
