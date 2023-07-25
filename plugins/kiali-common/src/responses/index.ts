import {
  CanaryUpgradeStatus,
  ComponentStatus,
  IstiodResourceThresholds,
  NamespaceInfo,
  OutboundTrafficPolicy,
} from '../types';

export type OverviewData = {
  namespaces: NamespaceInfo[];
  canaryUpgrade?: CanaryUpgradeStatus;
  istioStatus?: ComponentStatus[];
  outboundTraffic?: OutboundTrafficPolicy;
  istiodResourceThresholds?: IstiodResourceThresholds;
};
