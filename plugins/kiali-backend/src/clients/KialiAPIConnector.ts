import { Response } from 'node-fetch';
import { Logger } from 'winston';

import {
  computePrometheusRateParams,
  config,
  defaultMetricsDuration,
  defaultServerConfig,
  Direction,
  FetchResponse,
  FetchResponseWrapper,
  FetchResult,
  IstioMetricsOptions,
  KialiConfigT,
  KialiDetails,
  KialiFetchError,
  NamespaceInfo,
  nsWideMTLSStatus,
  OverviewData,
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
      `?${filters ? filters : ''}&duration=${options.duration}` +
      `&step=${options.step}&rateInterval=${options.rateInterval}` +
      `&direction=${options.direction}&reporter=${options.reporter}`
    );
  };

  async fetchConfig(): Promise<FetchResponseWrapper> {
    const auth = await this.kialiFetcher.checkSession();
    const errors: KialiFetchError[] = [];
    const warnings: KialiFetchError[] = [];
    this.logger.debug(`Authentication: ${auth.ok}`);
    if (auth.ok) {
      this.logger.info(
        `Authenticated user ${this.kialiFetcher.getSession().username}`,
      );
      this.logger.debug(`Fetching configuration`);
      const [serverConfig, meshTls, status, istioCerts] = await Promise.all([
        this.kialiFetcher.fetchResource(config.api.urls.serverConfig),
        this.kialiFetcher.fetchResource(config.api.urls.meshTls()),
        this.kialiFetcher.fetchResource(config.api.urls.status),
        this.kialiFetcher.fetchResource(config.api.urls.istioCertsInfo()),
      ]);

      if (serverConfig.ok && meshTls.ok && status.ok && istioCerts.ok) {
        this.kialiconfig.server = await serverConfig.json();
        this.kialiconfig.meshTLSStatus = await meshTls.json();
        this.kialiconfig.status = await status.json();
        this.kialiconfig.istioCerts = await istioCerts.json();
        this.kialiconfig.username = this.kialiFetcher.getSession().username;
        return {
          errors,
          warnings,
          response: this.kialiconfig,
        } as FetchResponseWrapper;
      }
      if (!serverConfig.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(serverConfig)
          .then(err => errors.push(err));
      }
      if (!meshTls.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(meshTls)
          .then(err => errors.push(err));
      }
      if (!status.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(status)
          .then(err => errors.push(err));
      }
      if (!istioCerts.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(istioCerts)
          .then(err => errors.push(err));
      }
      return {
        errors,
        warnings,
        response: this.kialiconfig,
      } as FetchResponseWrapper;
    }

    await this.kialiFetcher
      .handleUnsuccessfulResponse(auth)
      .then(err => errors.push(err));
    return {
      errors,
      warnings,
      response: this.kialiconfig,
    } as FetchResponseWrapper;
  }

  assing = () => {};

  async fetchOverviewNamespaces(
    query: OverviewQuery,
  ): Promise<FetchResponseWrapper> {
    this.logger.debug(`Fetching namespaces`);
    const errors: KialiFetchError[] = [];
    const warnings: KialiFetchError[] = [];
    const result: OverviewData = {
      namespaces: [],
    };
    const getNamespaces = await this.kialiFetcher.fetchResource(
      config.api.urls.namespaces,
    );
    if (getNamespaces.ok) {
      const namespaces = await getNamespaces.json();
      const allNamespaces: NamespaceInfo[] = filterNsByAnnotation(
        namespaces,
        query.annotation,
      );

      this.logger.info(`NS => ${JSON.stringify(allNamespaces)}`);

      // Query Options for metrics
      const direction = query.direction;
      const duration = query.duration || defaultMetricsDuration;
      const globalScrapeInterval = 15;
      const meshStatus = 'MTLS_NOT_ENABLED';
      const overviewType = query.overviewType;
      const queryTime = undefined;
      const rateParams = computePrometheusRateParams(
        duration,
        globalScrapeInterval,
        10,
      );
      const options: IstioMetricsOptions = {
        filters: ['request_count', 'request_error_count'],
        duration: duration,
        step: rateParams.step,
        rateInterval: rateParams.rateInterval,
        direction: (direction as Direction) || 'inbound',
        reporter: direction === 'inbound' ? 'destination' : 'source',
      };

      const [
        canaryUpgrade,
        istioStatus,
        outboundTrafficPolicyMode,
        istiodResourceThresholds,
        fetchNsValidations,
      ] = await Promise.all([
        this.kialiFetcher.fetchResource(config.api.urls.canaryUpgradeStatus()),
        this.kialiFetcher.fetchResource(config.api.urls.istioStatus()),
        this.kialiFetcher.fetchResource(
          config.api.urls.outboundTrafficPolicyMode(),
        ),
        this.kialiFetcher.fetchResource(
          config.api.urls.istiodResourceThresholds(),
        ),
        this.kialiFetcher.fetchResource(
          `${config.api.urls.configValidations()}?namespaces=${allNamespaces
            .map(n => n.name)
            .join(',')}`,
        ),
        allNamespaces.map(ns =>
          this.kialiFetcher
            .fetchResource(config.api.urls.namespaceTls(ns.name))
            .then(
              (r: Response): Promise<FetchResult> =>
                r.ok
                  ? r.json().then(tlsNs => {
                      ns.tlsStatus = {
                        status: nsWideMTLSStatus(tlsNs.status, meshStatus),
                        autoMTLSEnabled: tlsNs.autoMTLSEnabled,
                        minTLS: tlsNs.minTLS,
                      };
                      return tlsNs;
                    })
                  : this.kialiFetcher
                      .handleUnsuccessfulResponse(r)
                      .then(err => warnings.push(err)),
            ),
        ),
        allNamespaces.map(ns =>
          this.kialiFetcher
            .fetchResource(
              `${config.api.urls.namespaceMetrics(ns.name)}${this.queryMetrics(
                options,
              )}`,
            )
            .then(
              (r: Response): Promise<FetchResult> =>
                r.ok
                  ? r.json().then((metricsNs): FetchResponse => {
                      ns.metrics = metricsNs.request_count;
                      ns.errorMetrics = metricsNs.request_error_count;
                      if (ns.name === this.kialiconfig.server.istioNamespace) {
                        ns.controlPlaneMetrics = {
                          istiod_proxy_time:
                            metricsNs.pilot_proxy_convergence_time,
                          istiod_cpu: metricsNs.process_cpu_seconds_total,
                          istiod_mem: metricsNs.process_virtual_memory_bytes,
                        };
                      }
                      return ns;
                    })
                  : this.kialiFetcher
                      .handleUnsuccessfulResponse(r)
                      .then(err => warnings.push(err)),
            ),
        ),
        allNamespaces.map(ns =>
          this.kialiFetcher
            .fetchResource(
              `${config.api.urls.namespaceHealth(
                ns.name,
              )}?type=${overviewType}&rateInterval=${duration}s${
                queryTime ? `&queryTime=${queryTime}` : ''
              }`,
            )
            .then(
              (r: Response): Promise<FetchResult> =>
                r.ok
                  ? r.json().then(health => {
                      ns.nsHealth = health;
                      return health;
                    })
                  : this.kialiFetcher
                      .handleUnsuccessfulResponse(r)
                      .then(err => warnings.push(err)),
            ),
        ),
      ]);

      // handle Multiple fetchs
      await Promise.all([]);

      if (
        canaryUpgrade.ok &&
        istioStatus.ok &&
        outboundTrafficPolicyMode.ok &&
        istiodResourceThresholds.ok &&
        fetchNsValidations.ok
      ) {
        result.canaryUpgrade = await canaryUpgrade.json();
        result.istioStatus = await istioStatus.json();
        result.outboundTraffic = await outboundTrafficPolicyMode.json();
        result.istiodResourceThresholds = await istiodResourceThresholds.json();

        // Validations
        const nsValidations = await fetchNsValidations.json();
        allNamespaces.forEach((n, index) => {
          allNamespaces[index].validations = nsValidations[n.cluster][n.name];
        });

        this.logger.info(`NS => ${JSON.stringify(allNamespaces)}`);

        result.namespaces = allNamespaces;
        return {
          errors,
          warnings,
          response: result,
        } as FetchResponseWrapper;
      }
      if (!canaryUpgrade.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(canaryUpgrade)
          .then(err => errors.push(err));
      }
      if (!istioStatus.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(istioStatus)
          .then(err => errors.push(err));
      }
      if (!outboundTrafficPolicyMode.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(outboundTrafficPolicyMode)
          .then(err => errors.push(err));
      }
      if (!istiodResourceThresholds.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(istiodResourceThresholds)
          .then(err => errors.push(err));
      }
      if (!fetchNsValidations.ok) {
        this.kialiFetcher
          .handleUnsuccessfulResponse(fetchNsValidations)
          .then(err => errors.push(err));
      }

      return {
        errors,
        warnings,
        response: {},
      } as FetchResponseWrapper;
    }
    return {
      errors: errors,
      response: {},
    } as FetchResponseWrapper;
  }
}
