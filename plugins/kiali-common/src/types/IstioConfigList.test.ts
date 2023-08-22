import { filterConfigValidations, IstioConfigItem } from './IstioConfigList';

const items: IstioConfigItem[] = [
  {
    namespace: 'bookinfo',
    type: 'service',
    name: 'productpage',
    validation: {
      name: 'Check',
      objectType: 'validation',
      valid: true,
      checks: [],
    },
  },
  {
    namespace: 'bookinfo',
    type: 'service',
    name: 'details',
    validation: {
      name: 'Check',
      objectType: 'validation',
      valid: false,
      checks: [],
    },
  },
  {
    namespace: 'bookinfo',
    type: 'service',
    name: 'reviews',
  },
];
describe('IstioConfigList', () => {
  describe('filterConfigValidations', () => {
    it('returns filtered correctly the istiovalidations', () => {
      const filterByValid = true;
      const filterByWarning = false;
      const filterByNotValidated = true;
      const result = filterConfigValidations(items, {
        filterByValid,
        filterByWarning,
        filterByNotValidated,
      });
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('productpage');
      expect(result[1].name).toBe('reviews');
    });
  });
});
