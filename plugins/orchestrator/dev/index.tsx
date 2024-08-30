import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { OrchestratorPage, orchestratorPlugin } from '../src';

createDevApp()
  .registerPlugin(orchestratorPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: <OrchestratorPage />,
    title: 'Root Page',
    path: '/orchestrator',
  })
  .render();
