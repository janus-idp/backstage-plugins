import { EdgeLabelMode, GraphType, TrafficRate } from '../../../types/Graph';
import { Namespace } from '../../../types/Namespace';

export type GraphPFSettings = {
  activeNamespaces: Namespace[];
  edgeLabels: EdgeLabelMode[];
  graphType: GraphType;
  showOutOfMesh: boolean;
  showSecurity: boolean;
  showVirtualServices: boolean;
  trafficRates: TrafficRate[];
};
