/* ignore lint error for internal dependencies */
/* eslint-disable */
import {
  PipelineRun,
  PipelineRunsByEntityRequest,
} from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-enable */
import { TektonApi } from './types';

export class TektonBackendClientMock implements TektonApi {
  private readonly pipelineRuns: PipelineRun[];
  private readonly logs: string;
  private readonly error: string | undefined;
  private request: PipelineRunsByEntityRequest | null = null;

  constructor(
    pipelineRuns: PipelineRun[],
    logs: string,
    error: string | undefined = undefined,
  ) {
    this.pipelineRuns = pipelineRuns;
    this.logs = logs;
    this.error = error;
  }

  async getHealth(): Promise<{ status: string }> {
    return Promise.resolve({ status: 'ok' });
  }

  async getLogs(
    baseUrl: string,
    authorizationBearerToken: string,
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
    baseUrl: string,
    authorizationBearerToken: string,
    namespace: string,
    selector: string,
    dashboardBaseUrl: string,
  ): Promise<PipelineRun[]> {
    this.request = request;
    if (this.error) {
      return Promise.reject(new Error(this.error));
    }
    return Promise.resolve(this.pipelineRuns);
  }

  getRequest() {
    return this.request;
  }
}
