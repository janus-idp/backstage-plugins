import { mockK8sResourcesData } from '../__fixtures__/1-deployments';
import { getBaseTopologyDataModel } from './data-transformer';

describe('data-transformer', () => {
  it('should return base topology data model with 2 nodes and 0 edges', () => {
    const baseDataModel = getBaseTopologyDataModel(
      mockK8sResourcesData.watchResourcesData as any,
    );
    expect(baseDataModel.nodes).toHaveLength(2);
    expect(baseDataModel.edges).toHaveLength(0);
  });

  it('should return base topology data model', () => {
    const mockWatchResourcesData = {
      ...mockK8sResourcesData.watchResourcesData,
      deployments: {
        data: [mockK8sResourcesData.watchResourcesData.deployments.data[0]],
      },
    };
    const baseDataModel = getBaseTopologyDataModel(
      mockWatchResourcesData as any,
    );
    expect(baseDataModel.nodes).toHaveLength(1);
    expect(baseDataModel.edges).toHaveLength(0);
  });
});
