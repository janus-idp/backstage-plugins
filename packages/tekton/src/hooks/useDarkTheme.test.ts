import { useTheme } from '@material-ui/core/styles';
import { renderHook } from '@testing-library/react-hooks';

import { useDarkTheme } from './useDarkTheme';

jest.mock('@material-ui/core/styles', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = useTheme as jest.Mock;

describe('useDarkTheme', () => {
  it('should add dark theme class to html tag', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'dark',
      },
    });
    renderHook(() => useDarkTheme());
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-theme-dark')).toBe(true);
  });

  it('should remove dark theme class from html tag', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'light',
      },
    });
    renderHook(() => useDarkTheme());
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-theme-dark')).toBe(false);
  });
});
