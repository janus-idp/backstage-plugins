import { Entity } from '@backstage/catalog-model';
import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

import { AxiosError } from 'axios';

import { config } from '../config';
import { AuthInfo } from '../types/Auth';
import { CertsInfo } from '../types/CertsInfo';
import { DurationInSeconds, HTTP_VERBS, TimeInSeconds } from '../types/Common';
import {
  AppHealth,
  NamespaceAppHealth,
  NamespaceServiceHealth,
  NamespaceWorkloadHealth,
  ServiceHealth,
  WorkloadHealth,
} from '../types/Health';
import { IstioConfigList, IstioConfigListQuery, IstioConfigsMap } from '../types/IstioConfigList';
import {
  CanaryUpgradeStatus,
  OutboundTrafficPolicy,
  ValidationStatus,
} from '../types/IstioObjects';
import {
  ComponentStatus,
  IstiodResourceThresholds,
} from '../types/IstioStatus';
import { IstioMetricsMap } from '../types/Metrics';
import { IstioMetricsOptions } from '../types/MetricsOptions';
import { Namespace } from '../types/Namespace';
import { ServerConfig } from '../types/ServerConfig';
import { StatusState } from '../types/StatusState';
import { TLSStatus } from '../types/TLSStatus';
import { WorkloadListItem, WorkloadNamespaceResponse } from '../types/Workload';
import { filterNsByAnnotation } from '../utils/entityFilter';
import { ServiceDetailsInfo, ServiceDetailsQuery } from '../types/ServiceInfo';
import { GraphDefinition, GraphElementsQuery, NodeParamsType, NodeType } from '../types/Graph';

export const ANONYMOUS_USER = 'anonymous';

export interface Response<T> {
  data: T;
}

/** API URLs */

const urls = config.api.urls;

/**  Headers Definitions */

const loginHeaders = config.login.headers;

/**  Helpers to Requests */

const getHeaders = (proxyUrl?: string): { [key: string]: string } => {
  if (proxyUrl) {
    return { 'Content-Type': 'application/x-www-form-urlencoded' };
  }
  return { ...loginHeaders };
};

/** Create content type correctly for a given request type */
const getHeadersWithMethod = (
  method: HTTP_VERBS,
  proxyUrl?: string,
): { [key: string]: string } => {
  const allHeaders = getHeaders(proxyUrl);
  if (method === HTTP_VERBS.PATCH) {
    allHeaders['Content-Type'] = 'application/json';
  }
  return allHeaders;
};

/* Backstage Requirement*/

export interface KialiApi {
  isDevEnv(): boolean;
  getAuthInfo(): Promise<AuthInfo>;
  getStatus(): Promise<StatusState>;
  getNamespaces(): Promise<Namespace[]>;
  getGraphElements(params: GraphElementsQuery): Promise<GraphDefinition>;
  getNodeGraphElements(
    node: NodeParamsType,
    params: GraphElementsQuery,
    cluster?: string
  ): Promise<GraphDefinition>;
  getNamespaceAppHealth(
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceAppHealth>;
  getNamespaceServiceHealth(
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceServiceHealth>;
  getNamespaceWorkloadHealth(
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceWorkloadHealth>;
  getServiceDetail(
    namespace: string,
    service: string,
    validate: boolean,
    cluster?: string,
    rateInterval?: DurationInSeconds
  ): Promise<ServiceDetailsInfo>;
  getServerConfig(): Promise<ServerConfig>;
  getMeshTls(cluster?: string): Promise<TLSStatus>;
  getNamespaceTls(namespace: string, cluster?: string): Promise<TLSStatus>;
  getOutboundTrafficPolicyMode(): Promise<OutboundTrafficPolicy>;
  getCanaryUpgradeStatus(): Promise<CanaryUpgradeStatus>;
  getIstiodResourceThresholds(): Promise<IstiodResourceThresholds>;
  getConfigValidations(cluster?: string): Promise<ValidationStatus>;
  getServiceMetrics(
    namespace: string,
    service: string,
    params: IstioMetricsOptions,
    cluster?: string
  ): Promise<IstioMetricsMap>;
  getAppMetrics(
    namespace: string,
    app: string,
    params: IstioMetricsOptions,
    cluster?: string
  ): Promise<IstioMetricsMap>;
  getWorkloadMetrics(
    namespace: string,
    workload: string,
    params: IstioMetricsOptions,
    cluster?: string
  ): Promise<IstioMetricsMap>;
  getAggregateMetrics(
    namespace: string,
    aggregate: string,
    aggregateValue: string,
    params: IstioMetricsOptions
  ): Promise<IstioMetricsMap>;
  getAllIstioConfigs(
    namespaces: string[],
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string,
  ): Promise<IstioConfigsMap>;
  getIstioConfig(
    namespace: string,
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string
  ): Promise<IstioConfigList>;
  getNamespaceMetrics(
    namespace: string,
    params: IstioMetricsOptions,
  ): Promise<Readonly<IstioMetricsMap>>;
  getIstioStatus(cluster?: string): Promise<ComponentStatus[]>;
  getIstioCertsInfo(): Promise<CertsInfo[]>;
  setEntity(entity?: Entity): void;
  status(): Promise<any>;

  getWorkloads(
    namespace: string,
    duration: number,
  ): Promise<WorkloadListItem[]>;
}

export const kialiApiRef = createApiRef<KialiApi>({
  id: 'plugin.kiali.service',
});

export interface ErrorAuth {
  title: string;
  message: string;
  helper: string;
}

export interface Response<T> {
  data: T;
}

interface ClusterParam {
  clusterName?: string;
}

type QueryParams<T> = T & ClusterParam;

/* End */

export class KialiApiClient implements KialiApi {
  private readonly discoveryApi: DiscoveryApi;
  private kialiUrl?: string;
  private entity?: Entity;

  constructor(discoveryApi: DiscoveryApi) {
    this.kialiUrl = '';
    this.discoveryApi = discoveryApi;
    this.entity = undefined;
  }

  private newRequest = async <T>(
    method: HTTP_VERBS,
    url: string,
    queryParams: any,
    data: any,
    proxy: boolean = true,
  ) => {
    if (this.kialiUrl === '') {
      this.kialiUrl = `${await this.discoveryApi.getBaseUrl('kiali')}`;
    }
    const kialiHeaders = getHeadersWithMethod(method);
    const endpoint = `${url}${
      queryParams && `?${new URLSearchParams(queryParams).toString()}`
    }`;
    const dataRequest = data;
    dataRequest.endpoint = endpoint;

    const jsonResponse = await fetch(
      `${this.kialiUrl}/${proxy ? 'proxy' : 'status'}`,
      {
        method: HTTP_VERBS.POST,
        headers: {
          'Content-Type': 'application/json',
          ...kialiHeaders,
        },
        body: JSON.stringify(dataRequest),
      },
    );

    return jsonResponse.json() as T;
  };

  isDevEnv = () => {
    return false;
  };

  status = async (): Promise<any> => {
    return this.newRequest<any>(
      HTTP_VERBS.GET,
      urls.status,
      {},
      {},
      false,
    ).then(resp => resp);
  };

  getAuthInfo = async (): Promise<AuthInfo> => {
    return this.newRequest<AuthInfo>(
      HTTP_VERBS.GET,
      urls.authInfo,
      {},
      {},
    ).then(resp => resp);
  };

  getStatus = async (): Promise<StatusState> => {
    return this.newRequest<StatusState>(
      HTTP_VERBS.GET,
      urls.status,
      {},
      {},
    ).then(resp => resp);
  };

  getNamespaces = async (): Promise<Namespace[]> => {
    return this.newRequest<Namespace[]>(
      HTTP_VERBS.GET,
      urls.namespaces,
      {},
      {},
    ).then(resp => filterNsByAnnotation(resp, this.entity));
  };

  getServerConfig = async (): Promise<ServerConfig> => {
    return this.newRequest<ServerConfig>(
      HTTP_VERBS.GET,
      urls.serverConfig,
      {},
      {},
    ).then(resp => resp);
  };

  /* Graph */

  getGraphElements = (params: GraphElementsQuery): Promise<GraphDefinition> => {
    return this.newRequest<GraphDefinition>(HTTP_VERBS.GET, urls.namespacesGraphElements, params, {});
  };

  getNodeGraphElements = (
    node: NodeParamsType,
    params: GraphElementsQuery,
    cluster?: string
  ): Promise<GraphDefinition> => {
    const queryParams: QueryParams<GraphElementsQuery> = { ...params };
  
    if (cluster) {
      queryParams.clusterName = cluster;
    }
  
    switch (node.nodeType) {
      case NodeType.AGGREGATE:
        return !node.service
          ? this.newRequest<GraphDefinition>(
              HTTP_VERBS.GET,
              urls.aggregateGraphElements(node.namespace.name, node.aggregate!, node.aggregateValue!),
              queryParams,
              {}
            )
          : this.newRequest<GraphDefinition>(
              HTTP_VERBS.GET,
              urls.aggregateByServiceGraphElements(
                node.namespace.name,
                node.aggregate!,
                node.aggregateValue!,
                node.service
              ),
              queryParams,
              {}
            );
      case NodeType.APP:
      case NodeType.BOX: // we only support app box node graphs, so treat like app
        return this.newRequest<GraphDefinition>(
          HTTP_VERBS.GET,
          urls.appGraphElements(node.namespace.name, node.app, node.version),
          queryParams,
          {}
        );
      case NodeType.SERVICE:
        return this.newRequest<GraphDefinition>(
          HTTP_VERBS.GET,
          urls.serviceGraphElements(node.namespace.name, node.service),
          queryParams,
          {}
        );
      case NodeType.WORKLOAD:
        return this.newRequest<GraphDefinition>(
          HTTP_VERBS.GET,
          urls.workloadGraphElements(node.namespace.name, node.workload),
          queryParams,
          {}
        );
      default:
        // default to namespace graph
        return this.getGraphElements({ ...params, namespaces: node.namespace.name });
    }
  };

  /* HEALTH */

  getNamespaceAppHealth = (
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceAppHealth> => {
    const params: any = {
      type: 'app',
    };
    if (duration) {
      params.rateInterval = `${String(duration)}s`;
    }
    if (queryTime) {
      params.queryTime = String(queryTime);
    }
    if (cluster) {
      params.clusterName = cluster;
    }
    return this.newRequest<NamespaceAppHealth>(
      HTTP_VERBS.GET,
      urls.namespaceHealth(namespace),
      params,
      {},
    ).then(response => {
      const ret: NamespaceAppHealth = {};
      Object.keys(response).forEach(k => {
        ret[k] = AppHealth.fromJson(namespace, k, response[k], {
          rateInterval: duration,
          hasSidecar: true,
          hasAmbient: false,
        });
      });
      return ret;
    });
  };

  getNamespaceServiceHealth = (
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceServiceHealth> => {
    const params: any = {
      type: 'service',
    };
    if (duration) {
      params.rateInterval = `${String(duration)}s`;
    }
    if (queryTime) {
      params.queryTime = String(queryTime);
    }
    if (cluster) {
      params.clusterName = cluster;
    }
    return this.newRequest<NamespaceServiceHealth>(
      HTTP_VERBS.GET,
      urls.namespaceHealth(namespace),
      params,
      {},
    ).then(response => {
      const ret: NamespaceServiceHealth = {};
      Object.keys(response).forEach(k => {
        ret[k] = ServiceHealth.fromJson(namespace, k, response[k], {
          rateInterval: duration,
          hasSidecar: true,
          hasAmbient: false,
        });
      });
      return ret;
    });
  };

  getNamespaceWorkloadHealth = (
    namespace: string,
    duration: DurationInSeconds,
    cluster?: string,
    queryTime?: TimeInSeconds,
  ): Promise<NamespaceWorkloadHealth> => {
    const params: any = {
      type: 'workload',
    };
    if (duration) {
      params.rateInterval = `${String(duration)}s`;
    }
    if (queryTime) {
      params.queryTime = String(queryTime);
    }
    if (cluster) {
      params.clusterName = cluster;
    }
    return this.newRequest<NamespaceWorkloadHealth>(
      HTTP_VERBS.GET,
      urls.namespaceHealth(namespace),
      params,
      {},
    ).then(response => {
      const ret: NamespaceWorkloadHealth = {};
      Object.keys(response).forEach(k => {
        ret[k] = WorkloadHealth.fromJson(namespace, k, response[k], {
          rateInterval: duration,
          hasSidecar: true,
          hasAmbient: false,
        });
      });
      return ret;
    });
  };

  getServiceDetail = async (
    namespace: string,
    service: string,
    validate: boolean,
    cluster?: string,
    rateInterval?: DurationInSeconds
  ): Promise<ServiceDetailsInfo> => {
    const params: QueryParams<ServiceDetailsQuery> = {};
  
    if (validate) {
      params.validate = true;
    }
  
    if (rateInterval) {
      params.rateInterval = `${rateInterval}s`;
    }
  
    if (cluster) {
      params.clusterName = cluster;
    }
  
    return this.newRequest<ServiceDetailsInfo>(HTTP_VERBS.GET, urls.service(namespace, service), params, {}).then(r => {
      const info: ServiceDetailsInfo = r;
  
      if (info.health) {ServiceHealth
        // Default rate interval in backend = 600s
        info.health = ServiceHealth.fromJson(namespace, service, info.health, {
          rateInterval: rateInterval ?? 600,
          hasSidecar: info.istioSidecar,
          hasAmbient: info.istioAmbient
        });
      }
  
      return info;
    });
  };
  getNamespaceTls = (
    namespace: string,
    cluster?: string,
  ): Promise<TLSStatus> => {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return this.newRequest<TLSStatus>(
      HTTP_VERBS.GET,
      urls.namespaceTls(namespace),
      queryParams,
      {},
    ).then(resp => resp);
  };

  getMeshTls = (cluster?: string): Promise<TLSStatus> => {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return this.newRequest<TLSStatus>(
      HTTP_VERBS.GET,
      urls.meshTls(),
      queryParams,
      {},
    ).then(resp => resp);
  };

  getOutboundTrafficPolicyMode = (): Promise<OutboundTrafficPolicy> => {
    return this.newRequest<OutboundTrafficPolicy>(
      HTTP_VERBS.GET,
      urls.outboundTrafficPolicyMode(),
      {},
      {},
    ).then(resp => resp);
  };

  getCanaryUpgradeStatus = (): Promise<CanaryUpgradeStatus> => {
    return this.newRequest<CanaryUpgradeStatus>(
      HTTP_VERBS.GET,
      urls.canaryUpgradeStatus(),
      {},
      {},
    ).then(resp => resp);
  };

  getIstiodResourceThresholds = (): Promise<IstiodResourceThresholds> => {
    return this.newRequest<IstiodResourceThresholds>(
      HTTP_VERBS.GET,
      urls.istiodResourceThresholds(),
      {},
      {},
    ).then(resp => resp);
  };

  getConfigValidations = (cluster?: string): Promise<ValidationStatus> => {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return this.newRequest<ValidationStatus>(
      HTTP_VERBS.GET,
      urls.configValidations(),
      queryParams,
      {},
    ).then(resp => resp);
  };

  getAllIstioConfigs = (
    namespaces: string[],
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string,
  ): Promise<IstioConfigsMap> => {
    const params: any =
      namespaces && namespaces.length > 0
        ? { namespaces: namespaces.join(',') }
        : {};
    if (objects && objects.length > 0) {
      params.objects = objects.join(',');
    }
    if (validate) {
      params.validate = validate;
    }
    if (labelSelector) {
      params.labelSelector = labelSelector;
    }
    if (workloadSelector) {
      params.workloadSelector = workloadSelector;
    }
    if (cluster) {
      params.clusterName = cluster;
    }
    return this.newRequest<IstioConfigsMap>(
      HTTP_VERBS.GET,
      urls.allIstioConfigs(),
      params,
      {},
    ).then(resp => resp);
  };

  getAggregateMetrics = (
    namespace: string,
    aggregate: string,
    aggregateValue: string,
    params: IstioMetricsOptions
  ): Promise<IstioMetricsMap> => {
    return this.newRequest<IstioMetricsMap>(
      HTTP_VERBS.GET,
      urls.aggregateMetrics(namespace, aggregate, aggregateValue),
      params,
      {}
    );
  };

  getServiceMetrics = (
    namespace: string,
    service: string,
    params: IstioMetricsOptions,
    cluster?: string
  ): Promise<IstioMetricsMap> => {
    const queryParams: QueryParams<IstioMetricsOptions> = { ...params };
  
    if (cluster) {
      queryParams.clusterName = cluster;
    }
  
    return this.newRequest<IstioMetricsMap>(HTTP_VERBS.GET, urls.serviceMetrics(namespace, service), queryParams, {});
  };

  getAppMetrics = (
    namespace: string,
    app: string,
    params: IstioMetricsOptions,
    cluster?: string
  ): Promise<IstioMetricsMap> => {
    const queryParams: QueryParams<IstioMetricsOptions> = { ...params };
  
    if (cluster) {
      queryParams.clusterName = cluster;
    }
  
    return this.newRequest<IstioMetricsMap>(HTTP_VERBS.GET, urls.appMetrics(namespace, app), queryParams, {});
  };

  getWorkloadMetrics = (
    namespace: string,
    workload: string,
    params: IstioMetricsOptions,
    cluster?: string
  ): Promise<IstioMetricsMap> => {
    const queryParams: QueryParams<IstioMetricsOptions> = { ...params };
  
    if (cluster) {
      queryParams.clusterName = cluster;
    }
  
    return this.newRequest<IstioMetricsMap>(HTTP_VERBS.GET, urls.workloadMetrics(namespace, workload), queryParams, {});
  };

  getIstioConfig = (
    namespace: string,
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string
  ): Promise<IstioConfigList> => {
    const params: QueryParams<IstioConfigListQuery> = {};
  
    if (objects && objects.length > 0) {
      params.objects = objects.join(',');
    }
  
    if (validate) {
      params.validate = validate;
    }
  
    if (labelSelector) {
      params.labelSelector = labelSelector;
    }
  
    if (workloadSelector) {
      params.workloadSelector = workloadSelector;
    }
  
    if (cluster) {
      params.clusterName = cluster;
    }
  
    return this.newRequest<IstioConfigList>(HTTP_VERBS.GET, urls.istioConfig(namespace), params, {});
  };

  getNamespaceMetrics = (
    namespace: string,
    params: IstioMetricsOptions,
  ): Promise<Readonly<IstioMetricsMap>> => {
    return this.newRequest<Readonly<IstioMetricsMap>>(
      HTTP_VERBS.GET,
      urls.namespaceMetrics(namespace),
      params,
      {},
    ).then(resp => resp);
  };

  getIstioStatus = (cluster?: string): Promise<ComponentStatus[]> => {
    const queryParams: any = {};
    if (cluster) {
      queryParams.clusterName = cluster;
    }
    return this.newRequest<ComponentStatus[]>(
      HTTP_VERBS.GET,
      urls.istioStatus(),
      queryParams,
      {},
    ).then(resp => resp);
  };

  getIstioCertsInfo = (): Promise<CertsInfo[]> => {
    return this.newRequest<CertsInfo[]>(
      HTTP_VERBS.GET,
      urls.istioCertsInfo(),
      {},
      {},
    ).then(resp => resp);
  };

  setEntity = (entity?: Entity) => {
    this.entity = entity;
  };

  getWorkloads = async (
    namespace: string,
    duration: number,
  ): Promise<WorkloadListItem[]> => {
    return this.newRequest<WorkloadNamespaceResponse>(
      HTTP_VERBS.GET,
      urls.workloads(namespace),
      { health: true, istioResources: true, rateInterval: `${duration}s` },
      {},
    ).then(resp => {
      return resp.workloads.map(w => {
        return {
          name: w.name,
          namespace: resp.namespace.name,
          cluster: w.cluster,
          type: w.type,
          istioSidecar: w.istioSidecar,
          istioAmbient: w.istioAmbient,
          additionalDetailSample: undefined,
          appLabel: w.appLabel,
          versionLabel: w.versionLabel,
          labels: w.labels,
          istioReferences: w.istioReferences,
          notCoveredAuthPolicy: w.notCoveredAuthPolicy,
          health: WorkloadHealth.fromJson(
            resp.namespace.name,
            w.name,
            w.health,
            {
              rateInterval: duration,
              hasSidecar: w.istioSidecar,
              hasAmbient: w.istioAmbient,
            },
          ),
        };
      });
    });
  };
}

export const getErrorString = (error: AxiosError): string => {
  if (error && error.response) {
    // @ts-expect-error
    if (error.response.data && error.response.data.error) {
      // @ts-expect-error
      return error.response.data.error;
    }
    if (error.response.statusText) {
      let errorString = error.response.statusText;
      if (error.response.status === 401) {
        errorString += ': Has your session expired? Try logging in again.';
      }
      return errorString;
    }
  }
  return '';
};

export const getErrorDetail = (error: AxiosError): string => {
  if (error && error.response) {
    // @ts-expect-error
    if (error.response.data && error.response.data.detail) {
      // @ts-expect-error
      return error.response.data.detail;
    }
  }
  return '';
};
