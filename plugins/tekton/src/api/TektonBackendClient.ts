import { DiscoveryApi } from '@backstage/core-plugin-api';
import { TektonApi } from '@jquad-group/plugin-tekton-pipelines';
import {
  Cluster,
  PipelineRunsByEntityRequest,
} from '@jquad-group/plugin-tekton-pipelines-common';
import {
  TEKTON_PIPELINES_BUILD_NAMESPACE,
  TEKTON_PIPELINES_LABEL_SELECTOR,
} from './const';

export class TektonBackendClient implements TektonApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: { discoveryApi: DiscoveryApi }) {
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

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json();
    }

    return response.text();
  }

  async getHealth(): Promise<{ status: string }> {
    const baseUrl = await this.discoveryApi.getBaseUrl('tekton-pipelines');
    const url = `${baseUrl}/health`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }

  async getPipelineRuns(
    request: PipelineRunsByEntityRequest,
    _name: string,
    _baseUrl: string,
    _authorizationBearerToken: string,
    _namespace: string,
    _selector: string,
    _dashboardBaseUrl: string,
  ): Promise<Cluster[]> {
    const tektonBuildNamespace =
      request?.entity.metadata.annotations?.[
        TEKTON_PIPELINES_BUILD_NAMESPACE
      ] ?? '';
    const tektonLabelSelector =
      request?.entity.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR] ??
      '';
    const baseUrlPath = await this.discoveryApi.getBaseUrl('tekton-pipelines');
    const url = `${baseUrlPath}/pipelineruns?namespace=${tektonBuildNamespace}&selector=${tektonLabelSelector}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    return await this.handleResponse(response);
  }

  async getLogs(
    _baseUrl: string,
    _authorizationBearerToken: string,
    clusterName: string,
    namespace: string,
    taskRunPodName: string,
    stepContainer: string,
  ): Promise<string> {
    const baseUrlPath = await this.discoveryApi.getBaseUrl('tekton-pipelines');
    const url = `${baseUrlPath}/logs?clusterName=${clusterName}&namespace=${namespace}&taskRunPodName=${taskRunPodName}&stepContainer=${stepContainer}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    return await this.handleResponse(response);
  }
}
