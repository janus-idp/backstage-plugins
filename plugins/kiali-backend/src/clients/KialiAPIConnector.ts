import { Entity } from '@backstage/catalog-model';

import { AxiosResponse } from 'axios';
import { Logger } from 'winston';

import {
  AuthInfo,
  AuthStrategy,
  CanaryUpgradeStatus,
  CertsInfo,
  ComponentStatus,
  ComputedServerConfig,
  computePrometheusRateParams,
  config,
  defaultMetricsDuration,
  defaultServerConfig,
  Direction,
  FetchResponseWrapper,
  HealthNamespace,
  INITIAL_STATUS_STATE,
  IstiodResourceThresholds,
  IstioMetricsOptions,
  KialiConfigT,
  KialiDetails,
  KialiInfo,
  Namespace,
  NsMetrics,
  nsWideMTLSStatus,
  OutboundTrafficPolicy,
  OverviewData,
  StatusState,
  TLSStatus,
  ValidationStatus,
} from '@janus-idp/backstage-plugin-kiali-common';

import { filterNsByAnnotation } from '../filters/byAnnotation';
import { OverviewQuery } from '../service/router';
import { KialiFetcher } from './fetch';

export type Options = {
  logger: Logger;
  kiali: KialiDetails;
};

export interface KialiApi {
  fetchConfig(): Promise<FetchResponseWrapper>;
  fetchOverviewNamespaces(
    entity: Entity,
    query: OverviewQuery,
  ): Promise<FetchResponseWrapper>;
}

export class KialiApiImpl implements KialiApi {
  private readonly logger: Logger;
  private kialiDetails: KialiDetails;
  private kialiconfig: KialiConfigT;
  private kialiFetcher: KialiFetcher;

  constructor(options: Options) {
    options.logger.debug(`creating kiali client with url=${options.kiali.url}`);
    this.logger = options.logger;
    this.kialiDetails = options.kiali;
    this.kialiFetcher = new KialiFetcher(options.kiali, options.logger);
    this.kialiconfig = {
      server: defaultServerConfig,
      kialiConsole: options.kiali.url,
      meshTLSStatus: { status: '', autoMTLSEnabled: false, minTLS: '' },
      username: '',
    };
  }

  private queryMetrics = (options: IstioMetricsOptions) => {
    const filters = options.filters?.map(f => `filters[]=${f}`).join('&');
    return (
      `?${filters || ''}&duration=${options.duration}` +
      `&step=${options.step}&rateInterval=${options.rateInterval}` +
      `&direction=${options.direction}&reporter=${options.reporter}`
    );
  };

  private queryOptions = (query: OverviewQuery): IstioMetricsOptions => {
    const direction = query.direction;
    const duration = query.duration || defaultMetricsDuration;
    const globalScrapeInterval = 15;
    const rateParams = computePrometheusRateParams(
      duration,
      globalScrapeInterval,
      10,
    );
    return {
      filters: ['request_count', 'request_error_count'],
      duration: duration,
      step: rateParams.step,
      rateInterval: rateParams.rateInterval,
      direction: (direction as Direction) || 'inbound',
      reporter: direction === 'inbound' ? 'destination' : 'source',
    };
  };

  async fetchInfo(): Promise<FetchResponseWrapper> {
    const response: FetchResponseWrapper = { errors: [], warnings: [] };
    const info: KialiInfo = {
      status: INITIAL_STATUS_STATE,
      auth: { sessionInfo: {}, strategy: AuthStrategy.anonymous },
    };
    await Promise.all([
      this.kialiFetcher
        .newRequest<StatusState>('api')
        .then(resp => {
          info.status = resp.data;
          return info;
        })
        .catch(err =>
          response.errors.push(
            this.kialiFetcher.handleUnsuccessfulResponse(err),
          ),
        ),
      this.kialiFetcher
        .newRequest<AuthInfo>(config.api.urls.authInfo)
        .then(resp => {
          info.auth = resp.data;
          // Check if strategy is the same
          if (this.kialiDetails.strategy !== info.auth.strategy) {
            response.errors.push({
              errorType: 'Bad configuration',
              message: `Strategy in app-config is ${this.kialiDetails.strategy} and kiali server is configured for ${info.auth.strategy}`,
            });
          }
          return info;
        })
        .catch(err =>
          response.errors.push(
            this.kialiFetcher.handleUnsuccessfulResponse(err),
          ),
        ),
    ]);
    response.response = info;
    return response;
  }

  async fetchConfig(): Promise<FetchResponseWrapper> {
    let response: FetchResponseWrapper = { errors: [], warnings: [] };
    await this.kialiFetcher.checkSession().then(resp => {
      response = resp;
      return response;
    });
    if (response.errors.length === 0) {
      this.logger.info(
        `Authenticated user ${this.kialiFetcher.getSession().username}`,
      );
      this.logger.debug(`Fetching configuration`);
      await Promise.all([
        this.kialiFetcher
          .newRequest<ComputedServerConfig>(config.api.urls.serverConfig)
          .then(resp => {
            this.kialiconfig.server = resp.data;
            return this.kialiconfig;
          })
          .catch(err =>
            response.errors.push(
              this.kialiFetcher.handleUnsuccessfulResponse(err),
            ),
          ),
        this.kialiFetcher
          .newRequest<TLSStatus>(config.api.urls.meshTls())
          .then(resp => {
            this.kialiconfig.meshTLSStatus = resp.data;
            return this.kialiconfig;
          })
          .catch(err =>
            response.errors.push(
              this.kialiFetcher.handleUnsuccessfulResponse(err),
            ),
          ),
        this.kialiFetcher
          .newRequest<CertsInfo[]>(config.api.urls.istioCertsInfo())
          .then(resp => {
            this.kialiconfig.istioCerts = resp.data;
            return this.kialiconfig;
          })
          .catch(err =>
            response.errors.push(
              this.kialiFetcher.handleUnsuccessfulResponse(err),
            ),
          ),
      ]);
      this.kialiconfig.username = this.kialiFetcher.getSession().username;
      response.response = this.kialiconfig;
    }
    return response;
  }

  async fetchNamespaces(entity: Entity): Promise<FetchResponseWrapper> {
    const result: FetchResponseWrapper = {
      errors: [],
      warnings: [],
    };

    await this.kialiFetcher.checkSession().then(resp => {
      result.errors = resp.errors;
      result.warnings = resp.warnings;
      return result;
    });
    if (result.errors.length === 0) {
      await this.handlePromise<Namespace[]>(
        result,
        config.api.urls.namespaces,
        resp => (result.response = filterNsByAnnotation(resp.data, entity)),
      );
    }

    return result;
  }

  handlePromise<T>(
    result: FetchResponseWrapper,
    endpoint: string,
    handlerThen: (resp: AxiosResponse<T>) => void,
    handlerError?: (err: any) => void,
  ): Promise<number | void | T> {
    return this.kialiFetcher
      .newRequest<T>(endpoint)
      .then(resp => handlerThen(resp))
      .catch(err =>
        handlerError
          ? handlerError(err)
          : result.errors.push(
              this.kialiFetcher.handleUnsuccessfulResponse(err, endpoint),
            ),
      );
  }

  async fetchOverviewNamespaces(
    entity: Entity,
    query: OverviewQuery,
  ): Promise<FetchResponseWrapper> {
    this.logger.debug(`Fetching namespaces`);
    const result: FetchResponseWrapper = {
      errors: [],
      warnings: [],
    };

    const response: OverviewData = {
      namespaces: [],
    };
    await this.kialiFetcher.checkSession().then(resp => {
      result.errors = resp.errors;
      result.warnings = resp.warnings;
      return result;
    });
    if (result.errors.length === 0) {
      await this.handlePromise<Namespace[]>(
        result,
        config.api.urls.namespaces,
        resp => (response.namespaces = filterNsByAnnotation(resp.data, entity)),
      );

      if (result.errors.length === 0) {
        const meshStatus = 'MTLS_NOT_ENABLED';
        const duration = query.duration || defaultMetricsDuration;
        const overviewType = query.overviewType;
        const queryTime = undefined;
        const options = this.queryOptions(query);

        await Promise.all([
          this.handlePromise<CanaryUpgradeStatus>(
            result,
            config.api.urls.canaryUpgradeStatus(),
            resp => (response.canaryUpgrade = resp.data),
          ),
          this.handlePromise<ComponentStatus[]>(
            result,
            config.api.urls.istioStatus(),
            resp => (response.istioStatus = resp.data),
          ),
          this.handlePromise<OutboundTrafficPolicy>(
            result,
            config.api.urls.outboundTrafficPolicyMode(),
            resp => (response.outboundTraffic = resp.data),
          ),
          this.handlePromise<IstiodResourceThresholds>(
            result,
            config.api.urls.istiodResourceThresholds(),
            resp => (response.istiodResourceThresholds = resp.data),
          ),
          this.handlePromise<{
            [key: string]: { [key: string]: ValidationStatus };
          }>(
            result,
            `${config.api.urls.configValidations()}?namespaces=${response.namespaces
              .map(n => n.name)
              .join(',')}`,
            resp =>
              response.namespaces.forEach(
                (n, index) =>
                  (response.namespaces[index].validations =
                    resp.data[n.cluster][n.name]),
              ),
          ),
          response.namespaces.map(ns =>
            this.handlePromise<TLSStatus>(
              result,
              config.api.urls.namespaceTls(ns.name),
              resp =>
                (ns.tlsStatus = {
                  status: nsWideMTLSStatus(resp.data.status, meshStatus),
                  autoMTLSEnabled: resp.data.autoMTLSEnabled,
                  minTLS: resp.data.minTLS,
                }),
            ),
          ),
          response.namespaces.map(ns =>
            this.handlePromise<NsMetrics>(
              result,
              `${config.api.urls.namespaceMetrics(ns.name)}${this.queryMetrics(
                options,
              )}`,
              resp => {
                const metricsNs: NsMetrics = resp.data;
                ns.metrics = metricsNs.request_count;
                ns.errorMetrics = metricsNs.request_error_count;
                if (ns.name === this.kialiconfig.server.istioNamespace) {
                  ns.controlPlaneMetrics = {
                    istiod_proxy_time: metricsNs.pilot_proxy_convergence_time,
                    istiod_cpu: metricsNs.process_cpu_seconds_total,
                    istiod_mem: metricsNs.process_virtual_memory_bytes,
                  };
                }
              },
            ),
          ),
          response.namespaces.map(ns =>
            this.handlePromise<HealthNamespace>(
              result,
              `${config.api.urls.namespaceHealth(
                ns.name,
              )}?type=${overviewType}&rateInterval=${duration}s${
                queryTime ? `&queryTime=${queryTime}` : ''
              }`,
              resp => (ns.nsHealth = resp.data),
            ),
          ),
        ]);
      }
      result.response = response;
    }

    return result;
  }
}
