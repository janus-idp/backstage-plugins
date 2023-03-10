import { getDeploymentRevision } from './pod-resource-utils';

describe('PodResourceUtils', () => {
  it('should return deployment revision if annotations are present', () => {
    const deployment = {
      metadata: {
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
      },
    };
    expect(getDeploymentRevision(deployment)).toBe(1);
  });

  it('should return null if annotations are not present', () => {
    const deployment = {
      metadata: {
        annotations: {},
      },
    };
    expect(getDeploymentRevision(deployment)).toBe(null);
    expect(getDeploymentRevision({})).toBe(null);
  });
});
