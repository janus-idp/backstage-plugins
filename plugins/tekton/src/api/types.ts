import { createApiRef } from '@backstage/core-plugin-api';
import { TektonApi } from '@jquad-group/plugin-tekton-pipelines';

export const tektonPluginApiRef = createApiRef<TektonApi>({
  id: 'plugin.tekton.service',
});
