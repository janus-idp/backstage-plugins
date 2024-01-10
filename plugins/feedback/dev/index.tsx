import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { feedbackPlugin, GlobalFeedbackPage } from '../src/plugin';

createDevApp()
  .registerPlugin(feedbackPlugin)
  .addPage({
    element: <GlobalFeedbackPage />,
    title: 'Root Page',
    path: '/feedback',
  })
  .render();
