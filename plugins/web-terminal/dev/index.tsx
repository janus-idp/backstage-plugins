import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { WebTerminal, webTerminalPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(webTerminalPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: <WebTerminal />,
    title: 'Root Page',
    path: '/web-terminal',
  })
  .render();
