
import { createApiRef } from '@backstage/core-plugin-api';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { Cluster, PipelineRun, PipelineRunsByEntityRequest } from '@jquad-group/plugin-tekton-pipelines-common'
/* eslint-enable */
import { useApi as getBackstageCorePluginApi} from '@backstage/core-plugin-api';

export interface TektonApi {
  getHealth(): Promise<{ status: string; }>;
  getLogs(baseUrl: string, authorizationBearerToken: string, clusterName: string, namespace: string, taskRunPodName: string, stepContainer: string): Promise<string>;
  getPipelineRuns(request: PipelineRunsByEntityRequest, name: string, baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<Cluster[]>;
}

export const tektonApiRef = createApiRef<TektonApi>({
  id: 'plugin.tekton-pipelines.service',
});

export const getTektonApi = () : TektonApi => {
  return getBackstageCorePluginApi(tektonApiRef);
}

