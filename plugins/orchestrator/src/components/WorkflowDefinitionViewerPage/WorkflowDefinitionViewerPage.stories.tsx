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
import { fakeWorkflowItem } from '../../__fixtures__/fakeWorkflowItem';
import { fakeWorkflowOverview } from '../../__fixtures__/fakeWorkflowOverview';
import { fakeWorkflowSpecs } from '../../__fixtures__/fakeWorkflowSpecs';
import { veryLongString } from '../../__fixtures__/veryLongString';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import {
  orchestratorRootRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';

const meta = {
  title: 'Orchestrator/next/WorkflowDefinitionViewerPage',
  component: WorkflowDefinitionViewerPage,
  decorators: [
    (
      Story,
      context: {
        args: {
          workflowOverview?: WorkflowOverview;
          api?: MockOrchestratorClient;
          featureFlags?: string[];
        };
      },
    ) => {
      const defaultApi = new MockOrchestratorClient({
        getWorkflowOverviewResponse: Promise.resolve(
          context.args.workflowOverview || fakeWorkflowOverview,
        ),
        getWorkflowResponse: Promise.resolve(fakeWorkflowItem),
        getSpecsResponse: Promise.resolve(fakeWorkflowSpecs),
        createWorkflowDefinitionResponse: Promise.resolve(fakeWorkflowItem),
      });
      const featureFlagsApi = createFakeFeatureFlagsApi(
        context.args.featureFlags,
      );
      return wrapInTestApp(
        <TestApiProvider
          apis={[
            [orchestratorApiRef, context.args.api || defaultApi],
            [featureFlagsApiRef, featureFlagsApi],
          ]}
        >
          <Routes>
            <Route
              path={workflowDefinitionsRouteRef.path}
              element={<Story />}
            />
          </Routes>
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
          routeEntries: [`/workflows/yaml/${fakeWorkflowItem.definition.id}`],
        },
      );
    },
  ],
} satisfies Meta<typeof WorkflowDefinitionViewerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowDefinitionViewerPageStory: Story = {
  name: 'Has running workflows',
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
  args: {
    api: new MockOrchestratorClient({
      getWorkflowOverviewResponse: new Promise(() => {}),
      getWorkflowResponse: new Promise(() => {}),
    }),
  },
};

export const Editable: Story = {
  name: 'Editable',
  args: {
    featureFlags: [FEATURE_FLAG_DEVELOPER_MODE],
  },
};
