import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { kubernetesObjects } from '../__fixtures__/kubernetesObjects';
import { useLatestPipelineRun } from './useLatestPipelineRun';

jest.mock('@backstage/plugin-kubernetes', () => ({
  useKubernetesObjects: jest.fn(),
}));

const mockUseKubernetesObjects = useKubernetesObjects as jest.Mock;

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test-backstage',
      },
    },
  }),
}));

describe('useLatestPipelineRun:', () => {
  beforeEach(() => {
    (useKubernetesObjects as jest.Mock).mockReturnValue([
      mockKubernetesPlrResponse,
      false,
      null,
    ]);
  });
  it('should return the latest pipeline run', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: false,
      error: '',
    });
    const { result, rerender } = renderHook(() => useLatestPipelineRun());
    rerender();
    await waitFor(() => {
      expect(result.current[0].pipelineRun).toEqual(
        mockKubernetesPlrResponse.pipelineruns[1],
      );
    });
  });

  it('should return null if no pipeline runs are available', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: {},
      loading: false,
      error: '',
    });
    const { result, rerender } = renderHook(() => useLatestPipelineRun());
    rerender();
    await waitFor(() => {
      expect(result.current[0].pipelineRun).toEqual(null);
    });
  });

  it('should return null if pipeline runs are still loading', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: true,
      error: '',
    });
    const { result, rerender } = renderHook(() => useLatestPipelineRun());
    rerender();
    await waitFor(() => {
      expect(result.current[0].pipelineRun).toEqual(null);
    });
  });

  it('should return null if pipeline run call returns an error', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: true,
      error: { response: { status: 404 } },
    });
    const { result, rerender } = renderHook(() => useLatestPipelineRun());
    rerender();
    await waitFor(() => {
      expect(result.current[0].pipelineRun).toEqual(null);
    });
  });
});
