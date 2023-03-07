import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import { getTopologyEdgeItems } from './transform-utils';

describe('data-transformer', () => {
  it('should return edges for provided resource and workload resources if exists', () => {
    const mockDeploymentData = {
      ...mockKubernetesResponse.deployments[0],
      metadata: {
        ...mockKubernetesResponse.deployments[0].metadata,
        annotations: {
          ...mockKubernetesResponse.deployments[0].metadata.annotations,
          'app.openshift.io/connects-to': JSON.stringify([
            {
              apiVersion: 'apps/v1',
              kind: 'Deployment',
              name: 'hello-world-45',
            },
          ]),
        },
      },
    };
    const mockWorkloadResourcesData = [
      mockDeploymentData,
      mockKubernetesResponse.deployments[1],
    ];
    const edgeItems = getTopologyEdgeItems(
      mockDeploymentData as any,
      mockWorkloadResourcesData as any,
    );
    expect(edgeItems).toHaveLength(1);
  });

  it('should not return edges for provided resource and workload resources if not exists', () => {
    const edgeItems = getTopologyEdgeItems(
      mockKubernetesResponse.deployments[0] as any,
      mockKubernetesResponse.deployments as any,
    );
    expect(edgeItems).toHaveLength(0);
  });
});
