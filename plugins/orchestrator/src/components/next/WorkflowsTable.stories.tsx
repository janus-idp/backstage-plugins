import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { fakeProcessInstance } from '../../__fixtures__/fakeProcessInstance';
import { fakeWorkflowItem } from '../../__fixtures__/fakeWorkflowItem';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { WorkflowsTable } from './WorkflowsTable';

const meta = {
  title: 'Orchestrator/next',
  component: WorkflowsTable,
  decorators: [
    Story =>
      wrapInTestApp(
        <TestApiProvider
          apis={[
            [
              orchestratorApiRef,
              new MockOrchestratorClient({
                getInstancesResponse: Promise.resolve([fakeProcessInstance]),
                listWorkflowsResponse: Promise.resolve({
                  limit: 0,
                  offset: 0,
                  totalCount: 1,
                  items: [fakeWorkflowItem],
                }),
              }),
            ],
          ]}
        >
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator/next': orchestratorRootRouteRef,
          },
        },
      ),
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WorkflowsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowsTableStory: Story = {
  name: 'WorkflowsTable',
  args: {
    items: [],
  },
};
