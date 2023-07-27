import {
  ControlPlaneMetricsMap,
  KialiConfigT,
  Metric,
  NamespaceHealth,
  NamespaceInfo,
  OverviewData,
  TLSStatus,
} from '../';

export type NsMetrics = { [key: string]: Metric[] };
export type HealthNamespace = { [key: string]: NamespaceHealth };

export type FetchResponse =
  | KialiConfigT
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
