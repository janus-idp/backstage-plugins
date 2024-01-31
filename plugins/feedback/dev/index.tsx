import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { mockEntity } from '../src/mocks';
import {
  EntityFeedbackPage,
  feedbackPlugin,
  GlobalFeedbackPage,
  OpcFeedbackComponent,
} from '../src/plugin';

createDevApp()
  .registerPlugin(feedbackPlugin)
  .addPage({
    element: (
      <>
        <GlobalFeedbackPage /> <OpcFeedbackComponent />
      </>
    ),
    title: 'Root Page',
    path: '/feedback',
  })
  .addPage({
    element: (
      <div style={{ padding: '1rem' }}>
        <EntityProvider entity={mockEntity}>
          <EntityFeedbackPage />
        </EntityProvider>
        <OpcFeedbackComponent />
      </div>
    ),
    title: 'Entity Page',
    path: '/catalog/default/component/example-website-for-feedback-plugin',
  })
  .render();
