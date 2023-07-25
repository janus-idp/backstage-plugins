import { Namespace } from '@janus-idp/backstage-plugin-kiali-common';

import { exportedForTesting } from './byAnnotation';

const namespaceMock: Namespace[] = [
  {
    name: 'bookinfo',
    cluster: 'kubernetes',
    labels: {
      app: 'bookinfo',
      version: 'v1',
    },
  },
  {
    name: 'travel-agency',
    cluster: 'kubernetes',
    labels: {
      'backstage.io/kubernetes-id': 'travels',
      app: 'travels',
    },
  },
  {
    name: 'travel-control',
    cluster: 'kubernetes',
    labels: {
      app: 'travels',
    },
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

  describe('filterById', () => {
    it('returns travel-agency', async () => {
      const result = exportedForTesting.filterById(namespaceMock, 'travels');
      expect(result.length).toEqual(1);
      expect(result[0].name).toEqual('travel-agency');
    });
  });

  describe('filterBySelector', () => {
    it('returns travel-agency and travel-control', async () => {
      const result = exportedForTesting.filterBySelector(
        namespaceMock,
        'app=travels',
      );
      expect(result.length).toEqual(2);
      expect(result[0].name).toEqual('travel-agency');
      expect(result[1].name).toEqual('travel-control');
    });
  });
});
