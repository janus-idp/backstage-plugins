import {
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1StatefulSet,
} from '@kubernetes/client-node';

import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import {
  getDeploymentRevision,
  getPodsForCronJob,
  getPodsForDaemonSet,
  getPodsForDeployment,
  getPodsForStatefulSet,
} from './pod-resource-utils';

describe('PodResourceUtils', () => {
  let mockResources = {};
  beforeEach(() => {
    mockResources = {
      deployments: { data: mockKubernetesResponse.deployments },
      pods: { data: mockKubernetesResponse.pods },
      jobs: { data: mockKubernetesResponse.jobs },
      cronJobs: { data: mockKubernetesResponse.cronJobs },
      daemonSets: { data: mockKubernetesResponse.daemonSets },
      statefulsets: { data: mockKubernetesResponse.statefulsets },
      replicasets: { data: mockKubernetesResponse.replicasets },
    };
  });

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

  it('should return pods for a given Deployment', () => {
    let podRCData = getPodsForDeployment(
      mockKubernetesResponse.deployments[0] as V1Deployment,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(3);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForDeployment({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    podRCData = getPodsForDeployment(
      mockKubernetesResponse.deployments[1] as V1Deployment,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);

    podRCData = getPodsForDeployment(
      mockKubernetesResponse.deployments[2] as V1Deployment,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
  });

  it('should return pods when StatefulSet exists', () => {
    let podRCData = getPodsForStatefulSet(
      mockKubernetesResponse.statefulsets[0] as V1StatefulSet,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForStatefulSet({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    mockKubernetesResponse.statefulsets = [];
    podRCData = getPodsForStatefulSet(
      mockKubernetesResponse.statefulsets[0] as V1StatefulSet,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(0);
  });

  it('should return pods when DaemonSet exists', () => {
    let podRCData = getPodsForDaemonSet(
      mockKubernetesResponse.daemonSets[0] as V1DaemonSet,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForDaemonSet({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    podRCData = getPodsForDaemonSet(mockKubernetesResponse.daemonSets[0], {
      pods: { data: [] },
    });
    expect(podRCData.pods).toHaveLength(0);
  });

  it('should return pods when CronJob exists', () => {
    let podRCData = getPodsForCronJob(
      mockKubernetesResponse.cronJobs[0] as V1CronJob,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(1);
    expect(podRCData.current).not.toBeNull();
    expect(podRCData.previous).toBeFalsy();
    expect(podRCData.isRollingOut).toBeFalsy();

    podRCData = getPodsForCronJob({}, mockResources);
    expect(podRCData.pods).toHaveLength(0);

    mockResources = { jobs: { loaded: false, loadError: 'error', data: [] } };
    podRCData = getPodsForCronJob(
      mockKubernetesResponse.cronJobs[0] as V1CronJob,
      mockResources,
    );
    expect(podRCData.pods).toHaveLength(0);
  });
});
