import React from 'react';

import { AlertDisplay } from '@backstage/core-components';
import { TestApiProvider } from '@backstage/test-utils';
import { darkTheme, lightTheme } from '@backstage/theme';

import { CssBaseline, ThemeProvider } from '@material-ui/core';
import type { Preview } from '@storybook/react';
import { useDarkMode } from 'storybook-dark-mode';

import { apis } from './apis';

const preview: Preview = {
  decorators: [
    Story => (
      <TestApiProvider apis={apis}>
        <ThemeProvider theme={useDarkMode() ? darkTheme : lightTheme}>
          <CssBaseline>
            <AlertDisplay />
            <Story />
          </CssBaseline>
        </ThemeProvider>
      </TestApiProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
