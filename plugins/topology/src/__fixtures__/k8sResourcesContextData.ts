import { mockKubernetesResponse } from './1-deployments';

export const watchResourcesData = {
  deployments: { data: [] },
  pods: {
    data: mockKubernetesResponse.pods,
  },
  services: { data: [] },
  replicasets: { data: [] },
};
