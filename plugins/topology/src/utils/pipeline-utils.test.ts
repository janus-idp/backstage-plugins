import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import { mockPipeline, mockPipelineRun } from '../__fixtures__/tektonResources';
import { K8sResponseData } from '../types/types';
import {
  getPipelineRunsForPipeline,
  getPipelinesAndPipelineRunsForResource,
} from './pipeline-utils';

describe('getPipelineRunsForPipeline', () => {
  it('should return an empty array when pipeline runs data is empty', () => {
    const resources = {
      pipelineruns: {
        data: [],
      },
    };

    const result = getPipelineRunsForPipeline(mockPipeline, resources);

    expect(result).toEqual([]);
  });

  it('should return an empty array when pipeline name does not match', () => {
    const resources = {
      pipelineruns: {
        data: [mockPipelineRun as any],
      },
    } as K8sResponseData;

    const result = getPipelineRunsForPipeline(
      {
        ...mockPipeline,
        metadata: { ...mockPipeline.metadata, name: 'nationalparks-py' },
      },
      resources,
    );

    expect(result).toEqual([]);
  });

  it('should return an array of pipeline runs when pipeline name matches', () => {
    const resources = {
      pipelineruns: {
        data: [mockPipelineRun as any],
      },
    } as K8sResponseData;

    const result = getPipelineRunsForPipeline(mockPipeline, resources);

    expect(result).toEqual([mockPipelineRun]);
  });
});

describe('getPipelinesAndPipelineRunsForResource', () => {
  it('should return null when pipelines data is empty', () => {
    const resource: any = mockKubernetesResponse.deployments[0];

    const resources = {
      pipelines: {
        data: [],
      },
    };

    const result = getPipelinesAndPipelineRunsForResource(resource, resources);

    expect(result).toBeUndefined();
  });

  it('should return undefined when resource instance name is not available/different', () => {
    const resource: any = mockKubernetesResponse.deployments[0];

    const resources = {
      pipelines: {
        data: [
          {
            ...mockPipeline,
            metadata: {
              ...mockPipeline.metadata,
              labels: {},
            },
          },
        ],
      },
    } as K8sResponseData;

    const result = getPipelinesAndPipelineRunsForResource(resource, resources);

    expect(result).toBeUndefined();
  });

  it('should return pipelines and pipeline runs data for a matching resource', () => {
    const resource: any = mockKubernetesResponse.deployments[0];

    const resources = {
      pipelines: {
        data: [mockPipeline as any],
      },
      pipelineruns: {
        data: [mockPipelineRun as any],
      },
    } as K8sResponseData;

    const result = getPipelinesAndPipelineRunsForResource(resource, resources);

    expect(result).toEqual({
      pipelines: [mockPipeline],
      pipelineRuns: [mockPipelineRun],
    });
  });
});
