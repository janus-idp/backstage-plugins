import { Logger } from 'winston';

import {
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
  IstiodResourceThresholds,
  IstioMetricsOptions,
  KialiConfigT,
  KialiDetails,
  Namespace,
  NamespaceInfo,
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
  fetchOverviewNamespaces(query: OverviewQuery): Promise<FetchResponseWrapper>;
}

export class KialiApiImpl implements KialiApi {
  private readonly logger: Logger;
  private kialiconfig: KialiConfigT;
  private kialiFetcher: KialiFetcher;

  constructor(options: Options) {
    options.logger.debug(`creating kiali client with url=${options.kiali.url}`);
    this.logger = options.logger;
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
          .newRequest<StatusState>(config.api.urls.status)
          .then(resp => {
            this.kialiconfig.status = resp.data;
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

  async fetchOverviewNamespaces(
    query: OverviewQuery,
  ): Promise<FetchResponseWrapper> {
    this.logger.debug(`Fetching namespaces`);
    let response: FetchResponseWrapper = { errors: [], warnings: [] };
    await this.kialiFetcher.checkSession().then(resp => {
      response = resp;
      return response;
    });
    if (response.errors.length === 0) {
      let namespaces: Namespace[] = [];

      await this.kialiFetcher
        .newRequest<Namespace[]>(config.api.urls.namespaces)
        .then(resp => {
          namespaces = resp.data;
          return namespaces;
        })
        .catch(err =>
          response.errors.push(
            this.kialiFetcher.handleUnsuccessfulResponse(err),
          ),
        );

      if (response.errors.length === 0) {
        const filteredNamespaces: NamespaceInfo[] = filterNsByAnnotation(
          namespaces,
          query.annotation,
        );

        const result: OverviewData = {
          namespaces: [],
        };

        const meshStatus = 'MTLS_NOT_ENABLED';
        const duration = query.duration || defaultMetricsDuration;
        const overviewType = query.overviewType;
        const queryTime = undefined;
        const options = this.queryOptions(query);

        await Promise.all([
          this.kialiFetcher
            .newRequest<CanaryUpgradeStatus>(
              config.api.urls.canaryUpgradeStatus(),
            )
            .then(resp => {
              result.canaryUpgrade = resp.data;
              return result;
            })
            .catch(err =>
              response.errors.push(
                this.kialiFetcher.handleUnsuccessfulResponse(err),
              ),
            ),
          this.kialiFetcher
            .newRequest<ComponentStatus[]>(config.api.urls.istioStatus())
            .then(resp => {
              result.istioStatus = resp.data;
              return result;
            })
            .catch(err =>
              response.errors.push(
                this.kialiFetcher.handleUnsuccessfulResponse(err),
              ),
            ),
          this.kialiFetcher
            .newRequest<OutboundTrafficPolicy>(
              config.api.urls.outboundTrafficPolicyMode(),
            )
            .then(resp => {
              result.outboundTraffic = resp.data;
              return result;
            })
            .catch(err =>
              response.errors.push(
                this.kialiFetcher.handleUnsuccessfulResponse(err),
              ),
            ),
          this.kialiFetcher
            .newRequest<IstiodResourceThresholds>(
              config.api.urls.istiodResourceThresholds(),
            )
            .then(resp => {
              result.istiodResourceThresholds = resp.data;
              return result;
            })
            .catch(err =>
              response.errors.push(
                this.kialiFetcher.handleUnsuccessfulResponse(err),
              ),
            ),
          this.kialiFetcher
            .newRequest<{ [key: string]: { [key: string]: ValidationStatus } }>(
              `${config.api.urls.configValidations()}?namespaces=${filteredNamespaces
                .map(n => n.name)
                .join(',')}`,
            )
            .then(resp => {
              const nsValidations = resp.data;
              filteredNamespaces.forEach((n, index) => {
                filteredNamespaces[index].validations =
                  nsValidations[n.cluster][n.name];
              });
            })
            .catch(err =>
              response.errors.push(
                this.kialiFetcher.handleUnsuccessfulResponse(err),
              ),
            ),
          filteredNamespaces.map(ns =>
            this.kialiFetcher
              .newRequest<TLSStatus>(config.api.urls.namespaceTls(ns.name))
              .then(resp => {
                const tlsNs: TLSStatus = resp.data;
                ns.tlsStatus = {
                  status: nsWideMTLSStatus(tlsNs.status, meshStatus),
                  autoMTLSEnabled: tlsNs.autoMTLSEnabled,
                  minTLS: tlsNs.minTLS,
                };
                return tlsNs;
              })
              .catch(
                err =>
                  response.errors?.push(
                    this.kialiFetcher.handleUnsuccessfulResponse(err),
                  ),
              ),
          ),
          filteredNamespaces.map(ns =>
            this.kialiFetcher
              .newRequest<NsMetrics>(
                `${config.api.urls.namespaceMetrics(
                  ns.name,
                )}${this.queryMetrics(options)}`,
              )
              .then(resp => {
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
                return ns;
              })
              .catch(
                err =>
                  response.errors?.push(
                    this.kialiFetcher.handleUnsuccessfulResponse(err),
                  ),
              ),
          ),
          filteredNamespaces.map(ns =>
            this.kialiFetcher
              .newRequest<HealthNamespace>(
                `${config.api.urls.namespaceHealth(
                  ns.name,
                )}?type=${overviewType}&rateInterval=${duration}s${
                  queryTime ? `&queryTime=${queryTime}` : ''
                }`,
              )
              .then(resp => {
                const health: HealthNamespace = resp.data;
                ns.nsHealth = health;
                return ns;
              })
              .catch(
                err =>
                  response.errors?.push(
                    this.kialiFetcher.handleUnsuccessfulResponse(err),
                  ),
              ),
          ),
        ]);
        result.namespaces = filteredNamespaces;
        response.response = result;
      }
    }

    return response;
  }
}
