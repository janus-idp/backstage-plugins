
import { createApiRef } from '@backstage/core-plugin-api';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common'
/* eslint-enable */
import { useApi as getBackstageCorePluginApi} from '@backstage/core-plugin-api';

export interface TektonApi {
  getHealth(): Promise<{ status: string; }>;
  getLogs(baseUrl: string, authorizationBearerToken: string, namespace: string, taskRunPodName: string, stepContainer: string): Promise<string>;
  getPipelineRuns(request: PipelineRunsByEntityRequest, baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<PipelineRun[]>;
}

export const tektonApiRef = createApiRef<TektonApi>({
  id: 'plugin.tekton-pipelines.service',
});

export const getTektonApi = () : TektonApi => {
  return getBackstageCorePluginApi(tektonApiRef);
}

