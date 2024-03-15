import { AnalyticsEvent, ConfigApi } from '@backstage/core-plugin-api';

import { loadMatomo } from './loadMatomo';

declare const window: Window &
  typeof globalThis & {
    _paq: any[];
  };

type AnalyticsAPI = {};

type Options = {
  configApi: ConfigApi;
};

export class MatomoAnalytics implements AnalyticsAPI {
  private readonly configApi: ConfigApi;

  private constructor(options: Options) {
    this.configApi = options.configApi;
    const matomoUrl = this.configApi.getString('app.analytics.matomo.host');
    const matomoSiteId = this.configApi.getNumber(
      'app.analytics.matomo.siteId',
    );
    loadMatomo(matomoUrl, matomoSiteId);
  }

  static fromConfig(config: ConfigApi) {
    return new MatomoAnalytics({ configApi: config });
  }

  captureEvent(event: AnalyticsEvent) {
    const { context, action, subject, value } = event;
    // REF: https://github.com/backstage/backstage/blob/master/plugins/analytics-module-ga/src/apis/implementations/AnalyticsApi/GoogleAnalytics.ts#L160
    // REF: https://matomo.org/faq/reports/implement-event-tracking-with-matomo/
    window._paq.push([
      'trackEvent',
      context.extension || 'App',
      action,
      subject,
      value,
    ]);
  }
}
