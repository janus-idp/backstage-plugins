import { TektonApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common'

export class TektonBackendClient implements TektonApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
  }) {
    this.discoveryApi = options.discoveryApi;
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      throw new Error();
    }
    return await response.json();
  }

  async getHealth(): Promise<{ status: string; }> {
    const url = `${await this.discoveryApi.getBaseUrl('tekton-pipelines-plugin')}/health`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }

  async getPipelineRuns(baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<PipelineRun[]> {
    const url = `${await this.discoveryApi.getBaseUrl('tekton-pipelines-plugin')}/pipelineruns`;
    const response = await fetch(url, {
      method: 'GET',
    });
    
    return await this.handleResponse(response);
  }

}