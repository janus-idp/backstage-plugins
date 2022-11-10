import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { webTerminalPlugin, WebTerminal } from '../src/plugin';

createDevApp()
  .registerPlugin(webTerminalPlugin)
  .addPage({
    element: <WebTerminal />,
    title: 'Root Page',
    path: '/web-terminal',
  })
  .render();
