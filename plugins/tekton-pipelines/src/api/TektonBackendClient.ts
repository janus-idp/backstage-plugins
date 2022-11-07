import { TektonApi } from './types';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common'
import { useEntity } from '@backstage/plugin-catalog-react';

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
      throw new Error();
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
    const tektonBuildNamespace = request?.entity.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE] ?? '';//"sample-go-application-build"; //entity?.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE] ?? '';
    const tektonLabelSelector = request?.entity.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR] ?? ''; //""; //entity?.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR] ?? '';
    const url = `${await this.discoveryApi.getBaseUrl('tekton-pipelines')}/pipelineruns?namespace=${tektonBuildNamespace}&selector=${tektonLabelSelector}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    
    return await this.handleResponse(response);
  }

}