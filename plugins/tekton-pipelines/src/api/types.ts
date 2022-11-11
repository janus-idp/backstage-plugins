
import { createApiRef } from '@backstage/core-plugin-api';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common'
/* eslint-enable */
export interface TektonApi {
  getHealth(): Promise<{ status: string; }>;
  getPipelineRuns(request: PipelineRunsByEntityRequest, baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<PipelineRun[]>;
}

export const tektonApiRef = createApiRef<TektonApi>({
  id: 'plugin.tekton-pipelines.service',
});