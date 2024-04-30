import { renderHook, waitFor } from '@testing-library/react';

import { mockConditionRules } from '../__fixtures__/mockConditionRules';
import { mockTransformedConditionRules } from '../__fixtures__/mockTransformedConditionRules';
import { useConditionRules } from './useConditionRules';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getPluginsConditionRules: jest.fn().mockReturnValue([
      {
        pluginId: 'catalog',
        rules: [mockConditionRules[0].rules[0], mockConditionRules[0].rules[1]],
      },
      {
        pluginId: 'scaffolder',
        rules: [mockConditionRules[1].rules[0]],
      },
    ]),
  }),
}));

describe('useConditionRules', () => {
  it('should return condition-rules', async () => {
    const { result } = renderHook(() => useConditionRules());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTransformedConditionRules);
      expect(result.current.error).toBeUndefined();
    });
  });
});
