import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { ProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeProcessInstances } from '../../__fixtures__/fakeProcessInstance';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { WorkflowInstancePage } from './WorkflowInstancePage';

const delay = (timeMs: number) => {
  return new Promise(res => {
    setTimeout(res, timeMs);
  });
};

const getProcessInstance = async (
  instanceId?: string,
): Promise<ProcessInstance> => {
  if (instanceId === '__loading__') {
    await delay(5 * 1000);
    return fakeProcessInstances[0];
  }

  if (instanceId === fakeProcessInstances[0].id) {
    return fakeProcessInstances[0];
  }

  throw new Error('This is an example error for non existing instance');
};

const meta = {
  title: 'Orchestrator/next/WorkflowInstancePage',
  component: WorkflowInstancePage,
  decorators: [
    (Story, context) =>
      wrapInTestApp(
        <TestApiProvider
          apis={[
            [
              orchestratorApiRef,
              new MockOrchestratorClient({
                getInstanceResponse: getProcessInstance(
                  context.args.instanceId,
                ),
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
} satisfies Meta<typeof WorkflowInstancePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDataStory: Story = {
  name: 'Sample',
  args: {
    instanceId: fakeProcessInstances[0].id,
  },
};

export const LoadingStory: Story = {
  name: 'Loading',
  args: {
    instanceId: '__loading__',
  },
};

export const ErrorStory: Story = {
  name: 'Error',
  args: {
    instanceId: '__non_existing_id__',
  },
};
