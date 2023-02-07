import { Model, NodeModel } from '@patternfly/react-topology';
import { ExtPodKind } from './pods';
import { K8sResourceKind, WatchK8sResults } from './types';

export interface KindsMap {
  [key: string]: string;
}

export type OverviewItem<T = K8sResourceKind> = {
  obj: T;
};

export type TopologyResourcesObject = { [key: string]: K8sResourceKind[] };

export type TopologyDataResources = WatchK8sResults<TopologyResourcesObject>;

export type TopologyDataModelDepicted = (
  resource: K8sResourceKind,
  model: Model,
) => boolean;

export interface OdcNodeModel extends NodeModel {
  resource?: K8sResourceKind;
  resourceKind?: string;
}

export interface TopologyDataObject<D = {}> {
  id: string;
  name: string;
  type: string;
  resources: OverviewItem;
  pods?: ExtPodKind[];
  data: D;
  resource: K8sResourceKind | null;
  groupResources?: OdcNodeModel[];
}
