import React from 'react';
import { wrapInTestApp } from '@backstage/test-utils';
import { render } from '@testing-library/react';
import { useTheme } from '@material-ui/core';
import { act } from 'react-dom/test-utils';

import { ProjectOverviewPage } from './ProjectOverview';
import { TestApp } from '../TestApp';

jest.mock('@material-ui/core/styles', () => {
  const originalModule = jest.requireActual('@material-ui/core/styles');
  return {
    ...originalModule,
    useTheme: jest.fn(),
  };
});
const useThemeMock = useTheme as jest.Mock;

describe('ProjectOverview', () => {
  beforeEach(() => {
    useThemeMock.mockClear();
  });

  it('renders correctly', async () => {
    useThemeMock.mockReturnValue({
      transitions: {
        duration: {
          shortest: 100,
        },
      },
    });

    await act(async () => {
      const rendered = render(
        wrapInTestApp(() => {
          return (
            <TestApp>
              <ProjectOverviewPage />
            </TestApp>
          );
        }),
      );
      const { getByTestId, findByText, container } = rendered;
      expect(getByTestId('header-title').textContent).toBe('Projects overview');
      expect(getByTestId('button-add-new-project').textContent).toBe(
        'Add new project',
      );
      expect(getByTestId('button-add-new-project')).toBeEnabled();
      expect(getByTestId('button-add-new-project')).toHaveAttribute(
        'href',
        '/parodos/workflow',
      );

      // wait for re-render after receiving data
      await findByText('myProject');
      expect(
        container.querySelector('td[value="In Progress"]'),
      ).toBeInTheDocument();
    });
  });
});
