import {
  ControlPlaneMetricsMap,
  IstioConfigList,
  Metric,
  NamespaceHealth,
  TLSStatus,
  ValidationStatus,
} from './';

export interface Namespace {
  name: string;
  cluster: string;
  labels?: { [key: string]: string };
}
export type NamespaceInfo = {
  name: string;
  cluster: string;
  outboundPolicyMode?: string;
  status?: NamespaceStatus;
  tlsStatus?: TLSStatus;
  istioConfig?: IstioConfigList;
  validations?: ValidationStatus;
  metrics?: Metric[];
  errorMetrics?: Metric[];
  labels?: { [key: string]: string };
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  nsHealth?: { [key: string]: NamespaceHealth };
};

export type NamespaceStatus = {
  inNotReady: string[];
  inError: string[];
  inWarning: string[];
  inSuccess: string[];
  notAvailable: string[];
};

export const namespaceFromString = (namespace: string) => ({ name: namespace });

export const namespacesFromString = (namespaces: string) => {
  return namespaces.split(',').map(name => namespaceFromString(name));
};

export const namespacesToString = (namespaces: Namespace[]) =>
  namespaces.map(namespace => namespace.name).join(',');
