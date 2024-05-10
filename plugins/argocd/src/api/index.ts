import { createApiRef, IdentityApi } from '@backstage/core-plugin-api';

import { Application, Revision } from '../types';

export type ArgoCDAppDeployRevisionDetails = Revision;

export type listAppsOptions = {
  url: string;
  appSelector?: string;
  appNamespace?: string;
  projectName?: string;
};

export type RevisionDetailsOptions = {
  app: string;
  appNamespace?: string;
  revisionID: string;
  instanceName?: string;
};
export type RevisionDetailsListOptions = {
  appNamespace?: string;
  revisionIDs: string[];
  instanceName?: string;
  apps: Application[];
};
export interface ArgoCDApi {
  listApps(options: listAppsOptions): Promise<{ items: Application[] }>;
  getRevisionDetails(
    options: RevisionDetailsOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails>;
  getRevisionDetailsList(
    options: RevisionDetailsListOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails[]>;
}

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argo.cd.service',
});

export type Options = {
  backendBaseUrl: string;
  identityApi: IdentityApi;
  proxyPath?: string;
  useNamespacedApps: boolean;
};

const APP_NAMESPACE_QUERY_PARAM = 'appNamespace';

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly backendBaseUrl: string;
  private readonly identityApi: IdentityApi;
  private readonly useNamespacedApps: boolean;

  constructor(options: Options) {
    this.backendBaseUrl = options.backendBaseUrl;
    this.identityApi = options.identityApi;
    this.useNamespacedApps = options.useNamespacedApps;
  }

  async getBaseUrl() {
    return `${this.backendBaseUrl}/api/argocd`;
  }

  getQueryParams(params: { [p: string]: string | undefined }) {
    const result = Object.keys(params)
      .filter(key => params[key] !== undefined)
      .filter(
        key => key !== APP_NAMESPACE_QUERY_PARAM || this.useNamespacedApps,
      )
      .map(
        k =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`,
      )
      .join('&');
    return result ? `?${result}` : '';
  }

  async fetcher(url: string) {
    const { token } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    const json = await response.json();
    return json;
  }

  async listApps(options: {
    url: string;
    appSelector?: string;
    appNamespace?: string;
    projectName?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      selector: options.appSelector,
      project: options.projectName,
      appNamespace: options.appNamespace,
    });
    return this.fetcher(
      options.appSelector
        ? `${proxyUrl}${options.url}/applications/selector/${options.appSelector}${query}`
        : `${proxyUrl}${options.url}/applications${query}`,
    );
  }

  async getRevisionDetails(options: {
    app: string;
    appNamespace?: string;
    revisionID: string;
    instanceName: string;
  }) {
    const proxyUrl = await this.getBaseUrl();

    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    return this.fetcher(
      `${proxyUrl}/argoInstance/${
        options.instanceName
      }/applications/name/${encodeURIComponent(
        options.app as string,
      )}/revisions/${encodeURIComponent(
        options.revisionID as string,
      )}/metadata${query}`,
    );
  }

  async getRevisionDetailsList(options: {
    appNamespace: string;
    revisionIDs: string[];
    instanceName: string;
    apps: Application[];
  }): Promise<Revision[]> {
    if (!options.revisionIDs || options.revisionIDs.length < 1) {
      return Promise.resolve([]);
    }
    const promises: any = [];
    options.revisionIDs.forEach((revisionID: string) => {
      const application = options.apps.find(app =>
        app?.status?.history?.find(h => h.revision === revisionID),
      );
      if (application) {
        promises.push(
          this.getRevisionDetails({
            app: application.metadata.name as string,
            appNamespace: options.appNamespace,
            instanceName: options.instanceName,
            revisionID,
          }),
        );
      }
    });

    return Promise.all(promises);
  }
}
