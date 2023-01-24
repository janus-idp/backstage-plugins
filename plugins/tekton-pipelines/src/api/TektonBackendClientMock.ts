/* ignore lint error for internal dependencies */
/* eslint-disable */
import {
  Cluster,
  PipelineRun,
  PipelineRunsByEntityRequest,
} from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-enable */
import { TektonApi } from './types';

export class TektonBackendClientMock implements TektonApi {
  private readonly clusters: Cluster[];
  private readonly logs: string;
  private readonly error: string | undefined;
  private request: PipelineRunsByEntityRequest | null = null;

  constructor(
    clusters: Cluster[],
    logs: string,
    error: string | undefined = undefined,
  ) {
    this.clusters = clusters;
    this.logs = logs;
    this.error = error;
  }

  async getHealth(): Promise<{ status: string }> {
    return Promise.resolve({ status: 'ok' });
  }

  async getLogs(
    baseUrl: string,
    authorizationBearerToken: string,
    clusterName: string,
    namespace: string,
    taskRunPodName: string,
    stepContainer: string,
  ): Promise<string> {
    
    if (this.error) {
      return Promise.reject(new Error(this.error))
    }
    return Promise.resolve(this.logs)
  }

  async getPipelineRuns(
    request: PipelineRunsByEntityRequest,
    naem: string,
    baseUrl: string,
    authorizationBearerToken: string,
    namespace: string,
    selector: string,
    dashboardBaseUrl: string,
  ): Promise<Cluster[]> {
    this.request = request;
    if (this.error) {
      return Promise.reject(new Error(this.error));
    }
    return Promise.resolve(this.clusters);
  }

  getRequest() {
    return this.request;
  }
}
