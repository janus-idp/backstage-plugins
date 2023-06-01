import { createComponentExtension, createPlugin } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const webTerminalPlugin = createPlugin({
  id: 'web-terminal',
  routes: {
    root: rootRouteRef,
  },
});

export const WebTerminal = webTerminalPlugin.provide(
  createComponentExtension({
    name: 'WebTerminal',
    component: {
      lazy: () => import('./components/TerminalComponent').then((m) => m.TerminalComponent),
    },
  }),
);
