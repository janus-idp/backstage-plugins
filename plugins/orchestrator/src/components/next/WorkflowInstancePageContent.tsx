import React from 'react';
import { Link } from 'react-router-dom';

import { Content, InfoCard } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import { Grid, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment';

import { ProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { nextExecuteWorkflowRouteRef } from '../../routes';
import { firstLetterCapital } from '../../utils';
import { ProcessInstanceStatus } from './ProcessInstanceStatus';
import { WorkflowSuggestion } from './types';

export type WorkflowRunDetail = {
  id: string;
  name: string;
  workflow: string;
  status: string;
  started: string;
  duration: string;
  category?: string;
  description?: string;
  nextWorflowSuggestions?: {
    [key: string]: WorkflowSuggestion | WorkflowSuggestion[];
  };
};

export const mapProcessInstanceToDetails = (
  instance: ProcessInstance,
): WorkflowRunDetail => {
  const start = moment(instance.start?.toString());
  const end = moment(instance.end?.toString());
  const duration = moment.duration(start.diff(end));
  const name = instance.processName || instance.processId;

  let variables: Record<string, unknown> | undefined;
  if (typeof instance?.variables === 'string') {
    variables = JSON.parse(instance?.variables);
  } else {
    variables = instance?.variables;
  }

  const nextWorflowSuggestions: WorkflowRunDetail['nextWorflowSuggestions'] =
    // @ts-ignore
    variables?.workflowdata?.workflowOptions;

  const row: WorkflowRunDetail = {
    id: instance.id,
    name,
    workflow: name,
    started: start.format('MMM DD, YYYY LTS'),
    duration: duration.humanize(),
    category: instance.category,
    status: instance.state,
    description: instance.description,
    nextWorflowSuggestions,
  };

  return row;
};

const useStyles = makeStyles(_ => ({
  card: {
    height: '100%',
  },
  link: {
    color: '-webkit-link',
  },
}));

export const WorkflowInstancePageContent = ({
  processInstance,
}: {
  processInstance?: ProcessInstance;
}) => {
  const styles = useStyles();
  const executeWorkflowLink = useRouteRef(nextExecuteWorkflowRouteRef);

  if (!processInstance) {
    return <Skeleton />;
  }

  const details = mapProcessInstanceToDetails(processInstance);

  const detailLabelValues = [
    {
      label: 'Type',
      value: firstLetterCapital(details.category),
    },
    { label: 'Started', value: details.started },
    { label: 'Duration', value: details.duration },
    {
      label: 'Status',
      value: <ProcessInstanceStatus status={details.status} />,
    },
    { label: 'ID', value: details.id },
    { label: 'Description', value: details.description },
  ];

  const nextWorkflows: { title: string; link: string }[] = [];

  if (details.nextWorflowSuggestions) {
    Object.entries(details.nextWorflowSuggestions).forEach(([_, value]) => {
      const nextWorflowSuggestions: WorkflowSuggestion[] = Array.isArray(value)
        ? value
        : [value];
      nextWorflowSuggestions.forEach(nextWorflowSuggestion => {
        // Produce flat structure
        nextWorkflows.push({
          title: nextWorflowSuggestion.name,
          link: executeWorkflowLink({ workflowId: nextWorflowSuggestion.id }),
        });
      });
    });
  }

  return (
    <Content noPadding>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InfoCard title="Details" divider={false} className={styles.card}>
            <Grid container spacing={3}>
              {detailLabelValues.map(item => (
                <Grid item xs={4} key={item.label}>
                  <AboutField label={item.label} value={item.value as string} />
                </Grid>
              ))}
            </Grid>
          </InfoCard>
        </Grid>

        {
          /* details.category === WorkflowCategory.ASSESSMENT */ nextWorkflows.length >
            0 && (
            <Grid item xs={6}>
              <InfoCard
                title="Assessment Results"
                subheader="Select your next workflow"
                divider={false}
                className={styles.card}
              >
                <Grid container spacing={3}>
                  {nextWorkflows.map(item => (
                    <Grid item xs={4} key={item.title}>
                      <Link to={item.link} className={styles.link}>
                        {item.title}
                      </Link>
                    </Grid>
                  ))}
                </Grid>
              </InfoCard>
            </Grid>
          )
        }
      </Grid>
    </Content>
  );
};
