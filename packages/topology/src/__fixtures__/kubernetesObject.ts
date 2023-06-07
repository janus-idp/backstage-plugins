import { mockKubernetesResponse } from './1-deployments';

export const kubernetesObject = {
  items: [
    {
      cluster: {
        name: 'minikube',
      },
      podMetrics: [],
      resources: [
        {
          type: 'pods',
          resources: mockKubernetesResponse.pods,
        },
        {
          type: 'services',
          resources: [],
        },
        {
          type: 'configmaps',
          resources: [],
        },
        {
          type: 'limitranges',
          resources: [],
        },
        {
          type: 'deployments',
          resources: [],
        },
        {
          type: 'replicasets',
          resources: [],
        },
        {
          type: 'horizontalpodautoscalers',
          resources: [],
        },
        {
          type: 'jobs',
          resources: mockKubernetesResponse.jobs,
        },
        {
          type: 'cronjobs',
          resources: mockKubernetesResponse.cronJobs,
        },
        {
          type: 'ingresses',
          resources: [],
        },
        {
          type: 'statefulsets',
          resources: mockKubernetesResponse.statefulsets,
        },
        {
          type: 'daemonsets',
          resources: [],
        },
      ],
      errors: [],
    },
  ],
};
