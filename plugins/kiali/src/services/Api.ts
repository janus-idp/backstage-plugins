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
import { IstioConfigsMap } from '../types/IstioConfigList';
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
import { filterNsByAnnotation } from '../utils/entityFilter';

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
  getServerConfig(): Promise<ServerConfig>;
  getMeshTls(cluster?: string): Promise<TLSStatus>;
  getNamespaceTls(namespace: string, cluster?: string): Promise<TLSStatus>;
  getOutboundTrafficPolicyMode(): Promise<OutboundTrafficPolicy>;
  getCanaryUpgradeStatus(): Promise<CanaryUpgradeStatus>;
  getIstiodResourceThresholds(): Promise<IstiodResourceThresholds>;
  getConfigValidations(cluster?: string): Promise<ValidationStatus>;
  getAllIstioConfigs(
    namespaces: string[],
    objects: string[],
    validate: boolean,
    labelSelector: string,
    workloadSelector: string,
    cluster?: string,
  ): Promise<IstioConfigsMap>;
  getNamespaceMetrics(
    namespace: string,
    params: IstioMetricsOptions,
  ): Promise<Readonly<IstioMetricsMap>>;
  getIstioStatus(cluster?: string): Promise<ComponentStatus[]>;
  getIstioCertsInfo(): Promise<CertsInfo[]>;
  setEntity(entity?: Entity): void;
  status(): Promise<any>;
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
