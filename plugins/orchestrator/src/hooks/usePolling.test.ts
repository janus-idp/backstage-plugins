import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { SHORT_REFRESH_INTERVAL } from '../constants';
import usePolling from './usePolling';

const ACTIVE = 'active';
const ACTIVE1 = 'active1';
const ABORTED = 'aborted';
const COMPLETED = 'completed';

describe('usePolling', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  test('should return loading true on initial load', async () => {
    const mockAsyncFn = jest.fn().mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    expect(result.current.loading).toEqual(true);
  });

  test('should return loading false when loading, if not initial load', async () => {
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(ACTIVE)
      .mockReturnValueOnce(new Promise(() => {}));
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
  });

  test('should return correct initial value', async () => {
    const mockAsyncFn = jest.fn().mockResolvedValueOnce(ACTIVE);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    expect(result.current.loading).toEqual(false);
    expect(result.current.error).toEqual(undefined);
    expect(result.current.value).toEqual(ACTIVE);
  });

  test('should return correct polled value', async () => {
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(ACTIVE)
      .mockResolvedValueOnce(ACTIVE1)
      .mockResolvedValueOnce(COMPLETED);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    expect(result.current.value).toEqual(ACTIVE);
    await act(async () => jest.advanceTimersByTime(SHORT_REFRESH_INTERVAL));
    expect(result.current.value).toEqual(ACTIVE1);
    await act(async () => jest.advanceTimersByTime(SHORT_REFRESH_INTERVAL));
    expect(result.current.value).toEqual(COMPLETED);
  });

  test('should not continue polling after continueRefresh callback returns false', async () => {
    const continueRefresh = jest
      .fn()
      .mockImplementation((value: string) => value !== COMPLETED);
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(ACTIVE)
      .mockResolvedValueOnce(COMPLETED)
      .mockResolvedValueOnce(ACTIVE1);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL, continueRefresh),
    );
    await waitForNextUpdate();
    expect(result.current.value).toEqual(ACTIVE);
    for (let i = 0; i < 5; i++) {
      await act(async () => jest.advanceTimersByTime(SHORT_REFRESH_INTERVAL));
      expect(result.current.value).toEqual(COMPLETED);
    }
    expect(mockAsyncFn).toHaveBeenCalledTimes(2);
  });

  test('should return error if fails on first load attempt', async () => {
    const mockAsyncFn = jest.fn().mockRejectedValue('test error');
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    expect(result.current.error).toEqual('test error');
  });

  test('should not return error if fails on after first loading, on first polling error, and should preserve previous value', async () => {
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(ACTIVE)
      .mockResolvedValueOnce(ACTIVE1)
      .mockResolvedValueOnce(COMPLETED)
      .mockRejectedValueOnce('test error');
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    for (let i = 0; i < 3; ++i) {
      await act(async () => jest.advanceTimersByTime(SHORT_REFRESH_INTERVAL));
    }
    expect(result.current.value).toEqual(COMPLETED);
    expect(result.current.error).toBeUndefined();
  });

  test('should return error if fails three times, and should preserve previous value, and stop polling', async () => {
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(ACTIVE)
      .mockResolvedValueOnce(ACTIVE1)
      .mockRejectedValueOnce('test error')
      .mockRejectedValueOnce('test error')
      .mockRejectedValueOnce('test error')
      .mockReturnValueOnce(COMPLETED);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    for (let i = 0; i < 5; ++i) {
      await act(async () => jest.advanceTimersByTime(SHORT_REFRESH_INTERVAL));
    }
    expect(result.current.value).toEqual(ACTIVE1);
    expect(result.current.error).toEqual('test error');
    expect(mockAsyncFn).toHaveBeenCalledTimes(5);
  });

  test('should continue polling after less than three errors during polling', async () => {
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(ACTIVE)
      .mockRejectedValueOnce('test error')
      .mockRejectedValueOnce('test error')
      .mockResolvedValueOnce(COMPLETED);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    for (let i = 0; i < 3; ++i) {
      await act(async () => jest.advanceTimersByTime(SHORT_REFRESH_INTERVAL));
    }
    expect(result.current.value).toEqual(COMPLETED);
    expect(result.current.error).toEqual(undefined);
  });

  test('should update value after restart', async () => {
    const mockAsyncFn = jest
      .fn()
      .mockResolvedValueOnce(COMPLETED)
      .mockResolvedValueOnce(ABORTED);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePolling(mockAsyncFn, SHORT_REFRESH_INTERVAL),
    );
    await waitForNextUpdate();
    expect(result.current.value).toEqual(COMPLETED);
    await act(async () => result.current.restart());
    expect(result.current.value).toEqual(ABORTED);
  });
});
