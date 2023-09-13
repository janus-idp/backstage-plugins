// First is timestamp, second is value, third is y0
export type Datapoint = [number, number, number?];

export type MetricsStatsState = {
  data: Map<string, MetricsStats>;
};

const directionTypes = {
  inbound: 'Inbound',
  outbound: 'Outbound',
};

const overviewTypes = {
  app: 'Apps',
  workload: 'Workloads',
  service: 'Services',
};

export type OverviewType = keyof typeof overviewTypes;
export type DirectionType = keyof typeof directionTypes;

export interface Metric {
  labels: Labels;
  datapoints: Datapoint[];
  name: string;
  stat?: string;
}

export type ControlPlaneMetricsMap = {
  istiod_proxy_time?: Metric[];
  istiod_cpu?: Metric[];
  istiod_mem?: Metric[];
};

export type IstioMetricsMap = {
  grpc_received?: Metric[];
  grpc_sent?: Metric[];
  request_count?: Metric[];
  request_error_count?: Metric[];
  request_duration_millis?: Metric[];
  request_throughput?: Metric[];
  response_throughput?: Metric[];
  request_size?: Metric[];
  response_size?: Metric[];
  tcp_received?: Metric[];
  tcp_sent?: Metric[];
  pilot_proxy_convergence_time?: Metric[];
  process_cpu_seconds_total?: Metric[];
  process_virtual_memory_bytes?: Metric[];
};

export enum MetricsObjectTypes {
  SERVICE,
  WORKLOAD,
  APP,
}

export interface MetricsStatsResult {
  stats: MetricsStatsMap;
  // Note: warnings here is for non-blocking errors, it's set when some stats are available, but not all, for instance due to inaccessible namespaces
  // For more serious errors (e.g. prometheus inaccessible) the query would return an HTTP error
  warnings?: string[];
}

// Key is built from query params, see StatsComparison.genKey. The same key needs to be generated server-side for matching.
export type MetricsStatsMap = { [key: string]: MetricsStats };

export interface MetricsStats {
  isCompact: boolean;
  responseTimes: Stat[];
}

export interface Stat {
  name: string;
  value: number;
}

// Collection of values for a single label, associated to a show/hide flag
export type SingleLabelValues = { [key: string]: boolean };

// Map of all labels (using prometheus name), each with its set of values
export type AllPromLabelsValues = Map<string, SingleLabelValues>;

export type Labels = {
  [key: string]: string;
};
