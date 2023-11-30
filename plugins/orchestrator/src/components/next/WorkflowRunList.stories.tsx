import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { fakeProcessInstances } from '../../__fixtures__/fakeProcessInstance';
import { fakeWorkflowItem } from '../../__fixtures__/fakeWorkflowItem';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { WorkflowRunListContent } from './WorkflowRunListContent';

const meta = {
  title: 'Orchestrator/next',
  component: WorkflowRunListContent,
  decorators: [
    Story =>
      wrapInTestApp(
        <TestApiProvider
          apis={[
            [
              orchestratorApiRef,
              new MockOrchestratorClient({
                getInstancesResponse: Promise.resolve(fakeProcessInstances),
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
} satisfies Meta<typeof WorkflowRunListContent>;

type Story = StoryObj<typeof meta>;

export const WorkfloRunListStory: Story = {
  name: 'WorkflowRunList',
  args: {},
};

export default meta;
