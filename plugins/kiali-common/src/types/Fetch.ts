import {
  ControlPlaneMetricsMap,
  KialiConfigT,
  Metric,
  NamespaceInfo,
  OverviewData,
  TLSStatus,
} from '../';

export type KialiErrorTypes =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED_ERROR'
  | 'NOT_FOUND'
  | 'SYSTEM_ERROR'
  | 'UNKNOWN_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIME_OUT'
  | 'FETCH_ERROR';

export type NsMetrics = { [key: string]: Metric[] };

export type FetchResponse =
  | KialiConfigT
  | OverviewData
  | NamespaceInfo
  | TLSStatus
  | NsMetrics
  | ControlPlaneMetricsMap;

export interface StatusError {
  errorType: KialiErrorTypes;
  message?: string;
  resourcePath?: string;
  statusCode?: number;
}

export type KialiFetchError = StatusError;

export interface FetchResponseWrapper {
  errors: KialiFetchError[];
  warnings: KialiFetchError[];
  response: FetchResponse;
}

export type FetchResult = FetchResponse | KialiFetchError | number;
