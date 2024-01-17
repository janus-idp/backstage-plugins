import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import {
  ProcessInstance,
  WorkflowItem,
  WorkflowSpecFile,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import {
  fakeActiveInstance,
  fakeCompletedInstance,
  fakeProcessInstances,
} from '../__fixtures__/fakeProcessInstance';
import { fakeWorkflowItem } from '../__fixtures__/fakeWorkflowItem';
import { fakeWorkflowSpecs } from '../__fixtures__/fakeWorkflowSpecs';
import { orchestratorApiRef } from '../api';
import { MockOrchestratorClient } from '../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../routes';
import { WorkflowInstancePage } from './WorkflowInstancePage';

const delay = (timeMs: number) => {
  return new Promise(res => {
    setTimeout(res, timeMs);
  });
};

const getFakeProcessInstance = async (
  context: { responseCounter?: number },
  instanceId?: string,
): Promise<ProcessInstance> => {
  if (instanceId === '__loading__') {
    await delay(5 * 1000);
    return fakeProcessInstances[0];
  }

  if (instanceId === fakeProcessInstances[0].id) {
    return fakeProcessInstances[0];
  }

  if (instanceId === '__auto_refresh__') {
    const ret = !context.responseCounter
      ? Promise.resolve(fakeActiveInstance)
      : Promise.resolve(fakeCompletedInstance);
    context.responseCounter = (context.responseCounter || 0) + 1;
    return ret;
  }

  if (instanceId === '__auto_refresh_three_errors__') {
    const ret = !context.responseCounter
      ? Promise.resolve(fakeActiveInstance)
      : Promise.reject(new Error('Test refresh error'));
    context.responseCounter = (context.responseCounter || 0) + 1;
    return ret;
  }

  throw new Error('This is an example error for non existing instance');
};

const getFakeWorkflowItem = async (
  workflowId?: string,
): Promise<WorkflowItem> => {
  if (workflowId === '__loading__') {
    await delay(5 * 1000);
    return fakeWorkflowItem;
  }

  return fakeWorkflowItem;
};

const getFakeSpecs = async (): Promise<WorkflowSpecFile[]> => {
  await delay(5 * 1000);
  return fakeWorkflowSpecs;
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
                getSpecsResponse: getFakeSpecs(),
                getWorkflowResponse: getFakeWorkflowItem(
                  context.args.instanceId,
                ),
                getInstanceResponse: () => {
                  return getFakeProcessInstance(
                    context as { responseCounter?: number },
                    context.args.instanceId,
                  );
                },
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

export const AutoRefreshErrors: Story = {
  name: 'Auto refresh',
  args: {
    instanceId: '__auto_refresh__',
  },
};

export const AutoRefresh3Errors: Story = {
  name: 'Auto refresh three errors',
  args: {
    instanceId: '__auto_refresh_three_errors__',
  },
};
