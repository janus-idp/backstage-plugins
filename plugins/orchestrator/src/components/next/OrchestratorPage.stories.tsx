import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { featureFlagsApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import {
  FEATURE_FLAG_DEVELOPER_MODE,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { createFakeFeatureFlagsApi } from '../../__fixtures__/fakeFeatureFlagsApi';
import { fakeProcessInstances } from '../../__fixtures__/fakeProcessInstance';
import { fakeWorkflowItem } from '../../__fixtures__/fakeWorkflowItem';
import { fakeWorkflowOverviewList } from '../../__fixtures__/fakeWorkflowOverviewList';
import { fakeWorkflowSpecs } from '../../__fixtures__/fakeWorkflowSpecs';
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
    (
      Story,
      context: {
        args: {
          items?: WorkflowOverview[];
          api?: MockOrchestratorClient;
          featureFlags?: string[];
        };
      },
    ) => {
      const items = context.args.items || fakeWorkflowOverviewList;
      const mockApi = new MockOrchestratorClient({
        getInstancesResponse: Promise.resolve(fakeProcessInstances),
        listWorkflowsOverviewResponse: Promise.resolve({
          limit: 0,
          offset: 0,
          totalCount: 0,
          items,
        }),
        getWorkflowResponse: Promise.resolve(fakeWorkflowItem),
        getSpecsResponse: Promise.resolve(fakeWorkflowSpecs),
      });
      return wrapInTestApp(
        <TestRouter>
          <TestApiProvider
            apis={[
              [orchestratorApiRef, mockApi],
              [
                featureFlagsApiRef,
                createFakeFeatureFlagsApi(context.args.featureFlags),
              ],
            ]}
          >
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

export const EditMode: Story = {
  name: 'Edit mode',
  args: {
    featureFlags: FEATURE_FLAG_DEVELOPER_MODE,
  },
};
