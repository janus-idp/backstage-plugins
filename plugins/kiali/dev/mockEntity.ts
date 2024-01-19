import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-namespace':
        'istio-system,bookinfo,travel-agency,travel-portal,travel-control',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};
