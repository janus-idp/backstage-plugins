import React from 'react';

import { AppTheme } from '@backstage/core-plugin-api';
import { UnifiedThemeProvider } from '@backstage/theme';

import DarkIcon from '@mui/icons-material/Brightness2';
import LightIcon from '@mui/icons-material/WbSunny';

import { useUpdateTheme } from '../../hooks/useUpdateTheme';
import { customDarkTheme } from '../../themes/darkTheme';
import { customLightTheme } from '../../themes/lightTheme';

const defaultThemes: (Partial<AppTheme> & Omit<AppTheme, 'theme'>)[] = [
  {
    id: 'light',
    title: 'Light Theme',
    variant: 'light',
    icon: <LightIcon />,
    Provider: ({ children }) => {
      const themeColors = useUpdateTheme('light');
      return (
        <UnifiedThemeProvider
          theme={customLightTheme(themeColors)}
          children={children}
        />
      );
    },
  },
  {
    id: 'dark',
    title: 'Dark Theme',
    variant: 'dark',
    icon: <DarkIcon />,
    Provider: ({ children }) => {
      const themeColors = useUpdateTheme('dark');
      return (
        <UnifiedThemeProvider
          theme={customDarkTheme(themeColors)}
          children={children}
        />
      );
    },
  },
];

export default defaultThemes;
