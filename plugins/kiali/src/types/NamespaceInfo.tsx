import { IstioConfigList } from './IstioConfigList';
import { ValidationStatus } from './IstioObjects';
import { ControlPlaneMetricsMap, Metric } from './Metrics';
import { TLSStatus } from './TLSStatus';

export type NamespaceInfo = {
  annotations?: { [key: string]: string };
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  cluster?: string;
  errorMetrics?: Metric[];
  isAmbient?: boolean;
  istioConfig?: IstioConfigList;
  labels?: { [key: string]: string };
  metrics?: Metric[];
  name: string;
  outboundPolicyMode?: string;
  status?: NamespaceStatus;
  tlsStatus?: TLSStatus;
  validations?: ValidationStatus;
};

export type NamespaceStatus = {
  inError: string[];
  inNotReady: string[];
  inSuccess: string[];
  inWarning: string[];
  notAvailable: string[];
};
