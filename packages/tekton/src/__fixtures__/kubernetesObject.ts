import { ObjectsByEntityResponse } from '@backstage/plugin-kubernetes-common';
import { mockKubernetesPlrResponse } from './1-pipelinesData';

export const kubernetesObjects: ObjectsByEntityResponse = {
  items: [
    {
      cluster: {
        name: 'minikube',
      },
      podMetrics: [],
      resources: [
        {
          type: 'customresources',
          resources: mockKubernetesPlrResponse.pipelineruns,
        },
        {
          type: 'customresources',
          resources: [],
        },
      ],
      errors: [],
    },
    {
      cluster: {
        name: 'ocp',
      },
      podMetrics: [],
      resources: [
        {
          type: 'customresources',
          resources: [],
        },
        {
          type: 'customresources',
          resources: [],
        },
      ],
      errors: [],
    },
  ],
};
