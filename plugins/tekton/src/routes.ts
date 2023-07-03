import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'tekton',
});

export const pipelineRunRouteRef = createSubRouteRef({
  id: 'pipeline-run-visualization',
  parent: rootRouteRef,
  path: '/cluster/:clusterName/pipelineRun/:pipelineRunName',
});
