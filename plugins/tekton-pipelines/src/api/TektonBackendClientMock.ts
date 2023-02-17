/* ignore lint error for internal dependencies */
/* eslint-disable */
import {
  Cluster,
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
    _baseUrl: string,
    _authorizationBearerToken: string,
    _clusterName: string,
    _namespace: string,
    _taskRunPodName: string,
    _stepContainer: string,
  ): Promise<string> {
    if (this.error) {
      return Promise.reject(new Error(this.error));
    }
    return Promise.resolve(this.logs);
  }

  async getPipelineRuns(
    request: PipelineRunsByEntityRequest,
    _naem: string,
    _baseUrl: string,
    _authorizationBearerToken: string,
    _namespace: string,
    _selector: string,
    _dashboardBaseUrl: string,
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
