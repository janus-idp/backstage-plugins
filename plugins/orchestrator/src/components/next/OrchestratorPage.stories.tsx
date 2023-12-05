import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeProcessInstances } from '../../__fixtures__/fakeProcessInstance';
import { fakeWorkflowOverviewList } from '../../__fixtures__/fakeWorkflowOverviewList';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { OrchestratorPage } from './OrchestratorPage';

/** This component is used in order to correctly render nested components using the `TabbedLayout.Route` component. */
const TestRouter: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <Routes>
    <Route path="/*" element={<>{children}</>} />
  </Routes>
);

const meta = {
  title: 'Orchestrator/next/OrchestratorPage',
  component: OrchestratorPage,
  decorators: [
    (Story, context) => {
      const mockApi = new MockOrchestratorClient({
        getInstancesResponse: Promise.resolve(fakeProcessInstances),
        listWorkflowsOverviewResponse: Promise.resolve({
          limit: 0,
          offset: 0,
          totalCount: 0,
          items: (context.args as { items: WorkflowOverview[] }).items,
        }),
      });
      return wrapInTestApp(
        <TestRouter>
          <TestApiProvider apis={[[orchestratorApiRef, mockApi]]}>
            <Story />
          </TestApiProvider>
        </TestRouter>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      );
    },
  ],
} satisfies Meta<typeof OrchestratorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrchestratorPageStory: Story = {
  name: 'Sample 1',
  args: {
    items: fakeWorkflowOverviewList.slice(0, 3),
  },
};
