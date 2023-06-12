import { V1Pod } from '@kubernetes/client-node';
import { Model, NodeModel } from '@patternfly/react-topology';
import {
  Node,
  TopologyQuadrant,
} from '@patternfly/react-topology/dist/esm/types';

import { K8sWorkloadResource } from './types';

export type OverviewItem<T = K8sWorkloadResource> = {
  obj: T;
};

export type TopologyDataModelDepicted = (
  resource: K8sWorkloadResource,
  model: Model,
) => boolean;

export interface OdcNodeModel extends NodeModel {
  resource?: K8sWorkloadResource;
  resourceKind?: string;
}

export interface TopologyDataObject<D = {}> {
  id: string;
  name: string;
  type: string;
  resources: OverviewItem;
  pods?: V1Pod[];
  data: D;
  resource: K8sWorkloadResource;
  groupResources?: OdcNodeModel[];
}

export type ResKindAbbrColor = {
  kindStr: string;
  kindAbbr?: string;
  kindColor?: string;
};

export type TopologyDecoratorGetter = (
  element: Node,
  radius: number,
  centerX: number,
  centerY: number,
) => React.ReactElement | null;

export type TopologyDecorator = {
  quadrant: TopologyQuadrant;
  decorator: TopologyDecoratorGetter;
};
