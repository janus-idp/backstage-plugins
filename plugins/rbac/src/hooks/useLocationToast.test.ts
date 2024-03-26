import { useLocation } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';

import { useLocationToast } from './useLocationToast';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('useLocationToast', () => {
  it('sets toast message based on location state', () => {
    const mockSetToastMessage = jest.fn();

    (useLocation as jest.Mock).mockReturnValue({
      state: { toastMessage: 'Success Message' },
    });

    renderHook(() => useLocationToast(mockSetToastMessage));

    expect(mockSetToastMessage).toHaveBeenCalledWith('Success Message');
  });

  it('cleans up by setting toast message to an empty string', () => {
    const mockSetToastMessage = jest.fn();

    (useLocation as jest.Mock).mockReturnValue({
      state: { toastMessage: 'Success Message' },
    });

    const { unmount } = renderHook(() => useLocationToast(mockSetToastMessage));
    unmount();

    expect(mockSetToastMessage).toHaveBeenCalledWith('');
  });
});
