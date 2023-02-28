import { V1Pod } from '@kubernetes/client-node';
import { Model, NodeModel } from '@patternfly/react-topology';
import { K8sWorkloadResource, K8sResponseData } from './types';

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

export type K8sResponse = {
  watchResourcesData?: K8sResponseData;
  loading?: boolean;
  error?: string;
};
