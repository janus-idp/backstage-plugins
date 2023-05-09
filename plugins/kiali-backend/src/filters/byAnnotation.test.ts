import request from 'supertest';

import {
  KUBERNETES_ANNOTATION,
  KUBERNETES_LABEL_SELECTOR,
  KUBERNETES_NAMESPACE,
  Namespace,
} from '@janus-idp/backstage-plugin-kiali-common';

import { exportedForTesting } from './byAnnotation';

const namespaceMock: Namespace[] = [
  {
    name: 'bookinfo',
    labels: {
      app: 'bookinfo',
      version: 'v1',
    },
  },
  {
    name: 'travel-agency',
  },
  {
    name: 'travel-control',
  },
];

describe('filterNsByAnnotation', () => {
  describe('filterByNs', () => {
    it('returns bookinfo', async () => {
      const result = exportedForTesting.filterByNs(
        namespaceMock,
        'bookinfo,istio-system',
      );
      expect(result.length).toEqual(1);
      expect(result[0].name).toEqual('bookinfo');
    });
  });
});
