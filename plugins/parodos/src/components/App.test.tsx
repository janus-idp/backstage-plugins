import React from 'react';
import { renderInTestApp } from '@backstage/test-utils';
import { Progress } from '@backstage/core-components';
import { useTheme } from '@material-ui/core';

jest.mock('@material-ui/core/styles', () => {
  const originalModule = jest.requireActual('@material-ui/core/styles');
  return {
    ...originalModule,
    useTheme: jest.fn(),
  };
});
const useThemeMock = useTheme as jest.Mock;

describe('Plugin tests', () => {
  beforeEach(() => {
    useThemeMock.mockClear();
  });

  // basic one to verify test setup
  it('can render Backstage Progress component', async () => {
    useThemeMock.mockReturnValue({
      transitions: {
        duration: {
          shortest: 100,
        },
      },
    });

    const { getByRole } = await renderInTestApp(<Progress />);
    expect(getByRole('progressbar')).not.toBeNull();
  });
});
