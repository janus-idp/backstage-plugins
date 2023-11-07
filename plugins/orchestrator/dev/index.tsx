import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { OrchestratorPage, orchestratorPlugin } from '../src';

createDevApp()
  .registerPlugin(orchestratorPlugin)
  .addPage({
    element: <OrchestratorPage />,
    title: 'Root Page',
    path: '/orchestrator',
  })
  .render();
