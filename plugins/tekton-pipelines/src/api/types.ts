
import { createApiRef } from '@backstage/core-plugin-api';
import { PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common'

export interface TektonApi {
  getHealth(): Promise<{ status: string; }>;
  getPipelineRuns(request: PipelineRunsByEntityRequest, baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<PipelineRun[]>;
}

export const tektonApiRef = createApiRef<TektonApi>({
  id: 'plugin.tekton-pipelines.service',
});