import {
  AuthInfo,
  ControlPlaneMetricsMap,
  KialiConfigT,
  Metric,
  NamespaceHealth,
  NamespaceInfo,
  OverviewData,
  StatusState,
  TLSStatus,
} from '../';

export type NsMetrics = { [key: string]: Metric[] };
export type HealthNamespace = { [key: string]: NamespaceHealth };

export interface KialiInfo {
  status: StatusState;
  auth: AuthInfo;
}
export type FetchResponse =
  | KialiConfigT
  | KialiInfo
  | OverviewData
  | NamespaceInfo
  | TLSStatus
  | NsMetrics
  | ControlPlaneMetricsMap
  | HealthNamespace;

export interface StatusError {
  errorType: string;
  message?: string;
  resourcePath?: string;
  statusCode?: number;
}

export type KialiFetchError = StatusError;

export interface FetchResponseWrapper {
  errors: KialiFetchError[];
  warnings: KialiFetchError[];
  response?: FetchResponse;
}

export type FetchResult = FetchResponse | KialiFetchError | number;
