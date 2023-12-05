import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeProcessInstances } from '../../__fixtures__/fakeProcessInstance';
import { fakeWorkflowOverviewList } from '../../__fixtures__/fakeWorkflowOverviewList';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { WorkflowRunsTabContent } from './WorkflowRunsTabContent';

const meta = {
  title: 'Orchestrator/next/WorkflowRunsTabContent',
  component: WorkflowRunsTabContent,
  decorators: [
    (Story, context) => {
      const api = new MockOrchestratorClient({
        getInstancesResponse: Promise.resolve(fakeProcessInstances),
        listWorkflowsOverviewResponse: Promise.resolve({
          limit: 0,
          offset: 0,
          totalCount: 1,
          items: (context.args as { items: WorkflowOverview[] }).items,
        }),
      });

      return wrapInTestApp(
        <TestApiProvider apis={[[orchestratorApiRef, api]]}>
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator/next': orchestratorRootRouteRef,
          },
        },
      );
    },
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WorkflowRunsTabContent>;

type Story = StoryObj<typeof meta>;

export const WorkflowRunsTabContentStory: Story = {
  name: 'Sample 1',
  args: {
    items: fakeWorkflowOverviewList,
  },
};

export default meta;
