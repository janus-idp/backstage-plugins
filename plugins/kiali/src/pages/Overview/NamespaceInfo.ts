import { IstioConfigList } from '../../types/IstioConfigList';
import { ValidationStatus } from '../../types/IstioObjects';
import { ControlPlaneMetricsMap, Metric } from '../../types/Metrics';
import { TLSStatus } from '../../types/TLSStatus';

export type NamespaceInfo = {
  name: string;
  cluster?: string;
  outboundPolicyMode?: string;
  status?: NamespaceStatus;
  tlsStatus?: TLSStatus;
  istioConfig?: IstioConfigList;
  validations?: ValidationStatus;
  metrics?: Metric[];
  errorMetrics?: Metric[];
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  isAmbient?: boolean;
};

export type NamespaceStatus = {
  inNotReady: string[];
  inError: string[];
  inWarning: string[];
  inSuccess: string[];
  notAvailable: string[];
};
