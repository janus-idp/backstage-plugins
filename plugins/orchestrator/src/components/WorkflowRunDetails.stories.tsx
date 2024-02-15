import React from 'react';

import { Content, InfoCard } from '@backstage/core-components';
import { wrapInTestApp } from '@backstage/test-utils';

import { makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid/Grid';
import { Meta, StoryObj } from '@storybook/react';

import { fakeCompletedInstance } from '../__fixtures__/fakeProcessInstance';
import { fakeWorkflowRunDetail } from '../__fixtures__/fakeWorkflowRunDetails';
import { veryLongString } from '../__fixtures__/veryLongString';
import { orchestratorRootRouteRef } from '../routes';
import { WorkflowRunDetails } from './WorkflowRunDetails';

const useStyles = makeStyles(_ => ({
  topRowCard: {
    height: '20rem',
  },
}));

const meta = {
  title: 'Orchestrator/WorkflowDetails',
  component: WorkflowRunDetails,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    layout: 'padded',
  },
  decorators: [
    Story =>
      wrapInTestApp(
        <Content noPadding>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <InfoCard
                title="Details"
                divider={false}
                className={useStyles().topRowCard}
              >
                <Story />
              </InfoCard>
            </Grid>
            <Grid item xs={6}>
              <InfoCard
                title="Another card"
                divider={false}
                className={useStyles().topRowCard}
              >
                <p>Nothing fancy here...</p>
              </InfoCard>
            </Grid>
          </Grid>
        </Content>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      ),
  ],
} satisfies Meta<typeof WorkflowRunDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Story1: Story = {
  name: 'Very long description',
  args: {
    assessedBy: fakeCompletedInstance,
    details: {
      ...fakeWorkflowRunDetail,
      description: veryLongString,
    },
  },
};
