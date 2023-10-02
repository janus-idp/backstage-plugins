import { ConfigApi, createApiRef } from '@backstage/core-plugin-api';

import {
  TActionByPageURLMetrics,
  TActionMetrics,
  TDeviceMetrics,
  TGeoMetrics,
  TUserVisitMetrics,
  TUserVisitReportData,
} from './types';

type Metric = { value: number; metric: string };

export type MatomoAPI = {
  getUserVisitMetrics: (
    idSite: string,
    period: string,
    date: string,
  ) => Promise<TUserVisitMetrics>;
  getUserGeoMetrics: (
    idSite: string,
    period: string,
    date: string,
  ) => Promise<TGeoMetrics>;
  getUserDeviceMetrics: (
    idSite: string,
    period: string,
    date: string,
  ) => Promise<TDeviceMetrics>;
  getUserActionByPageURL: (
    idSite: string,
    period: string,
    date: string,
  ) => Promise<
    Array<
      Omit<TActionByPageURLMetrics['reportData'][0], 'avg_time_on_page'> & {
        avg_time_on_page: number;
      }
    >
  >;
  getUserActionMetrics: (
    idSite: string,
    period: string,
    date: string,
  ) => Promise<Metric[]>;
};

type Options = {
  configApi: ConfigApi;
};

export const matomoApiRef = createApiRef<MatomoAPI>({
  id: 'plugin.matomo.service',
});

export const transformVisitByTime = (
  reportData: TUserVisitMetrics['reportData'],
) => {
  const data: { name: string; visitors: number; uniqVisitors: number }[] = [];
  Object.keys(reportData).forEach(key => {
    data.push({
      name: key,
      visitors:
        (reportData[key as keyof TUserVisitReportData] as TUserVisitReportData)
          .nb_visits || 0,
      uniqVisitors:
        (reportData[key as keyof TUserVisitReportData] as TUserVisitReportData)
          .nb_uniq_visitors || 0,
    });
  });
  return data.sort(
    (a, b) => new Date(a.name).valueOf() - new Date(b.name).valueOf(),
  );
};

export class MatomoApiClient implements MatomoAPI {
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
  }

  async getUserVisitMetrics(
    idSite: string,
    period: string,
    date: string,
  ): Promise<TUserVisitMetrics> {
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const res = await fetch(`${backendUrl}/api/matomo?module=API&format=json`, {
      method: 'POST',
      body: new URLSearchParams({
        idSite,
        method: 'API.getProcessedReport',
        period,
        date,
        apiModule: 'VisitsSummary',
        apiAction: 'get',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    return res.json();
  }

  async getUserGeoMetrics(
    idSite: string,
    period: string,
    date: string,
  ): Promise<TGeoMetrics> {
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const res = await fetch(`${backendUrl}/api/matomo?module=API&format=json`, {
      method: 'POST',
      body: new URLSearchParams({
        idSite,
        method: 'API.getProcessedReport',
        period,
        date,
        apiModule: 'UserCountry',
        apiAction: 'getCountry',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    return res.json();
  }

  async getUserDeviceMetrics(
    idSite: string,
    period: string,
    date: string,
  ): Promise<TDeviceMetrics> {
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const res = await fetch(`${backendUrl}/api/matomo?module=API&format=json`, {
      method: 'POST',
      body: new URLSearchParams({
        idSite,
        method: 'API.getProcessedReport',
        period,
        date,
        apiModule: 'DevicesDetection',
        apiAction: 'getType',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    return res.json();
  }

  async getUserActionByPageURL(
    idSite: string,
    period: string,
    date: string,
  ): Promise<
    Array<
      Omit<TActionByPageURLMetrics['reportData'][0], 'avg_time_on_page'> & {
        avg_time_on_page: number;
      }
    >
  > {
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const res = await fetch(`${backendUrl}/api/matomo?module=API&format=json`, {
      method: 'POST',
      body: new URLSearchParams({
        idSite,
        method: 'API.getProcessedReport',
        period,
        date,
        apiModule: 'Actions',
        apiAction: 'getPageUrls',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    const data = (await res.json()) as TActionByPageURLMetrics;
    return data.reportData.map(({ bounce_rate, avg_time_on_page, ...el }) => {
      const avgTimeStr = avg_time_on_page.split(':');
      const avgTime =
        parseInt(avgTimeStr[0], 10) * 3600 +
        parseInt(avgTimeStr[1], 10) * 60 +
        parseInt(avgTimeStr[2], 10);

      return {
        ...el,
        bounce_rate: bounce_rate.slice(0, -1),
        avg_time_on_page: avgTime,
      };
    });
  }

  async getUserActionMetrics(
    idSite: string,
    period: string,
    date: string,
  ): Promise<Metric[]> {
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const res = await fetch(`${backendUrl}/api/matomo?module=API&format=json`, {
      method: 'POST',
      body: new URLSearchParams({
        idSite,
        method: 'API.getProcessedReport',
        period,
        date,
        apiModule: 'Actions',
        apiAction: 'get',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    const { reportData, columns } = (await res.json()) as TActionMetrics;
    return Object.keys(columns).map(metric => ({
      metric: columns[metric as keyof TActionMetrics['reportData']],
      value: reportData?.[metric as keyof TActionMetrics['reportData']],
    }));
  }
}
