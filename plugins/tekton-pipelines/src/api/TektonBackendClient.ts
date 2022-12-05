import { TektonApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common'
/* eslint-enable */
export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR = "tektonci/pipeline-label-selector";


export class TektonBackendClient implements TektonApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: {
    discoveryApi: DiscoveryApi;
  }) {
    this.discoveryApi = options.discoveryApi;
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const payload = await response.text();
      let message;
      switch (response.status) {
        case 404:
          message =
            'Could not find the Kubernetes Backend (HTTP 404). Make sure the plugin has been fully installed.';
          break;
        default:
          message = `Request failed with ${response.status} ${response.statusText}, ${payload}`;
      }
      throw new Error(message);
    }
    
    return await response.json();
  }

  async getHealth(): Promise<{ status: string; }> {
    const url = `${await this.discoveryApi.getBaseUrl('tekton-pipelines')}/health`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }

  async getPipelineRuns(request: PipelineRunsByEntityRequest, baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<PipelineRun[]> {    
    const tektonBuildNamespace = request?.entity.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE] ?? '';
    const tektonLabelSelector = request?.entity.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR] ?? ''; 
    const url = `${await this.discoveryApi.getBaseUrl('tekton-pipelines')}/pipelineruns?namespace=${tektonBuildNamespace}&selector=${tektonLabelSelector}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    
    return await this.handleResponse(response);
  }

  async getLogs(baseUrl: string, authorizationBearerToken: string, namespace: string, taskRunPodName: string, stepContainer: string): Promise<string> {    

    const url = `${await this.discoveryApi.getBaseUrl('tekton-pipelines')}/logs?namespace=${namespace}&taskRunPodName=${taskRunPodName}&${stepContainer}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    
    return await this.handleResponse(response);
  }  

}