import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { ArgocdPage, argocdPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(argocdPlugin)
  .addPage({
    element: <ArgocdPage />,
    title: 'Root Page',
    path: '/argocd',
  })
  .render();
