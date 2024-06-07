import { useApi } from '@backstage/core-plugin-api';

import { renderHook, waitFor } from '@testing-library/react';

import { mockApplication } from '../../../dev/__data__';
import { useApplications } from '../useApplications';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('useApplications', () => {
  beforeEach(() => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
    });
  });

  test('should return empty if appselector is not passed', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({});
      },
    });
    const { result } = renderHook(() =>
      useApplications({
        instanceName: 'main',
        appSelector: null as unknown as string,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
      expect(result.current.apps).toHaveLength(0);
    });
  });

  test('should return empty if no applicaitons are available', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({});
      },
    });
    const { result } = renderHook(() =>
      useApplications({
        instanceName: 'main',
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(0);
    });
  });

  test('should return the applications and loading state', async () => {
    const { result } = renderHook(() =>
      useApplications({
        instanceName: 'main',
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
      }),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });
  });

  test('should return the applications and loading state when the app selector updates', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
    });

    const { result, rerender } = renderHook(prop => useApplications(prop), {
      initialProps: {
        instanceName: 'main',
        intervalMs: 10000,
        appSelector: 'rht.gitops.com/quarkus-app-test',
      },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });

    rerender({
      instanceName: 'main',
      intervalMs: 10000,
      appSelector: 'rht.gitops.com/quarkus-app-bootstrap',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.apps).toHaveLength(1);
    });
  });
});
