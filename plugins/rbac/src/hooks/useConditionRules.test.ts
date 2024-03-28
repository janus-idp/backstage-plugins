import { renderHook, waitFor } from '@testing-library/react';

import { useConditionRules } from './useConditionRules';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getPluginsConditionRules: jest.fn().mockReturnValue([
      { pluginId: 'plugin1', rules: ['rule1', 'rule2'] },
      { pluginId: 'plugin2', rules: ['rule3', 'rule4'] },
    ]),
  }),
}));

describe('useConditionRules', () => {
  it('should return condition-rules', async () => {
    const { result } = renderHook(() => useConditionRules());

    await waitFor(() => {
      expect(result.current.data).toEqual({
        plugin1: ['rule1', 'rule2'],
        plugin2: ['rule3', 'rule4'],
      });
      expect(result.current.error).toBeUndefined();
    });
  });
});
