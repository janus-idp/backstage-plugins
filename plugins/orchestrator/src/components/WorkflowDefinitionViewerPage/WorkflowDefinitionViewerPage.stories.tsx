import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeWorkflowItem } from '../../__fixtures__/fakeWorkflowItem';
import { fakeWorkflowOverview } from '../../__fixtures__/fakeWorkflowOverview';
import { veryLongString } from '../../__fixtures__/veryLongString';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';

const meta = {
  title: 'Orchestrator/workflow viewer page',
  component: WorkflowDefinitionViewerPage,
  decorators: [
    (Story, context) => {
      const api = new MockOrchestratorClient({
        getWorkflowOverviewResponse: Promise.resolve(
          (context.args as { workflowOverview: WorkflowOverview })
            .workflowOverview,
        ),
        getWorkflowResponse: Promise.resolve(fakeWorkflowItem),
      });
      return wrapInTestApp(
        <TestApiProvider apis={[[orchestratorApiRef, api]]}>
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      );
    },
  ],
} satisfies Meta<typeof WorkflowDefinitionViewerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowDefinitionViewerPageStory: Story = {
  name: 'Has running workflows',
  args: {
    workflowOverview: fakeWorkflowOverview,
  },
};

export const NoRunningWorkflows: Story = {
  name: 'No running workflows',
  args: {
    workflowOverview: {
      ...fakeWorkflowOverview,
      avgDurationMs: undefined,
      lastTriggeredMs: undefined,
      lastRunStatus: undefined,
    },
  },
};

export const LongDesription: Story = {
  name: 'Long description',
  args: {
    workflowOverview: {
      ...fakeWorkflowOverview,
      description: veryLongString,
    },
  },
};

export const Loading: Story = {
  name: 'Loading',
  args: {},
};
