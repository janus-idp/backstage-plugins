import { DurationInSeconds } from './Common';
import { parseHealthConfig } from './HealthConfig';

export type KialiDetails = {
  url: string;
  strategy: string;
  skipTLSVerify?: boolean;
  serviceAccountToken?: string;
  caData?: string;
  caFile?: string;
  sessionTime?: number;
};

export interface MeshCluster {
  apiEndpoint: string;
  isKialiHome: boolean;
  kialiInstances: KialiInstance[];
  name: string;
  network: string;
  secretName: string;
}

export interface KialiInstance {
  serviceName: string;
  namespace: string;
  operatorResource: string;
  url: string;
  version: string;
}

export type IstioLabelKey =
  | 'appLabelName'
  | 'versionLabelName'
  | 'injectionLabelName'
  | 'injectionLabelRev';

interface ClusterInfo {
  name: string;
  network: string;
}

interface DeploymentConfig {
  viewOnlyMode: boolean;
}

interface IstioAnnotations {
  // this could also be the name of the pod label, both label and annotation are supported
  istioInjectionAnnotation: string;
}

interface GraphFindOption {
  description: string;
  expression: string;
}

interface GraphTraffic {
  grpc: string;
  http: string;
  tcp: string;
}

interface GraphSettings {
  fontLabel: number;
  minFontBadge: number;
  minFontLabel: number;
}

interface GraphUIDefaults {
  findOptions: GraphFindOption[];
  hideOptions: GraphFindOption[];
  settings: GraphSettings;
  traffic: GraphTraffic;
}

interface UIDefaults {
  graph: GraphUIDefaults;
  metricsPerRefresh?: string;
  namespaces?: string[];
  refreshInterval?: string;
}

interface CertificatesInformationIndicators {
  enabled: boolean;
}

interface KialiFeatureFlags {
  certificatesInformationIndicators: CertificatesInformationIndicators;
  disabledFeatures: string[];
  istioInjectionAction: boolean;
  istioAnnotationAction: boolean;
  istioUpgradeAction: boolean;
  uiDefaults: UIDefaults;
}

// Not based exactly on Kiali configuration but rather whether things like prometheus config
// allow for certain Kiali features. True means the feature is crippled, false means supported.
export interface KialiCrippledFeatures {
  requestSize: boolean;
  requestSizeAverage: boolean;
  requestSizePercentiles: boolean;
  responseSize: boolean;
  responseSizeAverage: boolean;
  responseSizePercentiles: boolean;
  responseTime: boolean;
  responseTimeAverage: boolean;
  responseTimePercentiles: boolean;
}

interface IstioCanaryRevision {
  current: string;
  upgrade: string;
}

/*
 Health Config
*/
export type RegexConfig = string | RegExp;

export interface HealthConfig {
  rate: RateHealthConfig[];
}

// rateHealthConfig
export interface RateHealthConfig {
  namespace?: RegexConfig;
  kind?: RegexConfig;
  name?: RegexConfig;
  tolerance: ToleranceConfig[];
}
// toleranceConfig
export interface ToleranceConfig {
  code: RegexConfig;
  degraded: number;
  failure: number;
  protocol?: RegexConfig;
  direction?: RegexConfig;
}

/*
 End Health Config
*/

export interface ServerConfig {
  accessibleNamespaces: Array<string>;
  authStrategy: string;
  clusterInfo?: ClusterInfo;
  clusters: { [key: string]: MeshCluster };
  deployment: DeploymentConfig;
  gatewayAPIEnabled: boolean;
  healthConfig: HealthConfig;
  installationTag?: string;
  istioAnnotations: IstioAnnotations;
  istioCanaryRevision: IstioCanaryRevision;
  istioIdentityDomain: string;
  istioNamespace: string;
  istioLabels: { [key in IstioLabelKey]: string };
  kialiFeatureFlags: KialiFeatureFlags;
  logLevel: string;
  prometheus: {
    globalScrapeInterval?: DurationInSeconds;
    storageTsdbRetention?: DurationInSeconds;
  };
}

export type Durations = { [key: number]: string };

export type ComputedServerConfig = ServerConfig & {
  durations: Durations;
};

export const defaultServerConfig: ComputedServerConfig = {
  accessibleNamespaces: [],
  authStrategy: '',
  clusters: {},
  durations: {},
  gatewayAPIEnabled: false,
  logLevel: '',
  healthConfig: {
    rate: [],
  },
  deployment: {
    viewOnlyMode: false,
  },
  installationTag: 'Kiali Console',
  istioAnnotations: {
    istioInjectionAnnotation: 'sidecar.istio.io/inject',
  },
  istioCanaryRevision: {
    current: '',
    upgrade: '',
  },
  istioIdentityDomain: 'svc.cluster.local',
  istioNamespace: 'istio-system',
  istioLabels: {
    appLabelName: 'app',
    injectionLabelName: 'istio-injection',
    injectionLabelRev: 'istio.io/rev',
    versionLabelName: 'version',
  },
  kialiFeatureFlags: {
    certificatesInformationIndicators: {
      enabled: true,
    },
    disabledFeatures: [],
    istioInjectionAction: true,
    istioAnnotationAction: true,
    istioUpgradeAction: false,
    uiDefaults: {
      graph: {
        findOptions: [],
        hideOptions: [],
        settings: {
          fontLabel: 13,
          minFontBadge: 7,
          minFontLabel: 10,
        },
        traffic: {
          grpc: 'requests',
          http: 'requests',
          tcp: 'sent',
        },
      },
    },
  },
  prometheus: {
    globalScrapeInterval: 15,
    storageTsdbRetention: 21600,
  },
};

const toDurations = (tupleArray: [number, string][]): Durations => {
  const obj: { [key: number]: string } = {};
  tupleArray.forEach(tuple => {
    obj[tuple[0]] = tuple[1];
  });
  return obj;
};

const durationsTuples: [number, string][] = [
  [60, '1m'],
  [120, '2m'],
  [300, '5m'],
  [600, '10m'],
  [1800, '30m'],
  [3600, '1h'],
  [10800, '3h'],
  [21600, '6h'],
  [43200, '12h'],
  [86400, '1d'],
  [604800, '7d'],
  [2592000, '30d'],
];
export const computeValidDurations = (cfg: ComputedServerConfig) => {
  const tsdbRetention = cfg.prometheus.storageTsdbRetention;
  const scrapeInterval = cfg.prometheus.globalScrapeInterval;
  let filtered = durationsTuples.filter(
    d =>
      (!tsdbRetention || d[0] <= tsdbRetention!) &&
      (!scrapeInterval || d[0] >= scrapeInterval * 2),
  );
  // Make sure we keep at least one item, even if it's silly
  if (filtered.length === 0) {
    filtered = [durationsTuples[0]];
  }
  cfg.durations = toDurations(filtered);
};

export const setServerConfig = (
  serverConfig: ComputedServerConfig,
  cfg: ServerConfig,
) => {
  const config = { ...defaultServerConfig, ...cfg };
  config.healthConfig = cfg.healthConfig
    ? parseHealthConfig(cfg.healthConfig)
    : serverConfig.healthConfig;
  computeValidDurations(config);

  return config;
};
