import { useApi } from '@backstage/core-plugin-api';

import { renderHook, waitFor } from '@testing-library/react';

import { useBackstageUserIdentity } from '../useBackstageUserIdentity';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const identityMock = jest.fn();
const identityApi = {
  getBackstageIdentity: identityMock,
};

(useApi as jest.Mock).mockReturnValue(identityApi);

describe('useBackstageUserIdentity', () => {
  it('should return undefined when there is no user data available', async () => {
    const { result } = renderHook(() => useBackstageUserIdentity());

    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });

  it('should return user identity', async () => {
    identityMock.mockReturnValue({
      userEntityRef: 'user:default/guest',
    });
    const { result } = renderHook(() => useBackstageUserIdentity());

    await waitFor(() => {
      expect(result.current).not.toBeUndefined();
    });
  });
});
