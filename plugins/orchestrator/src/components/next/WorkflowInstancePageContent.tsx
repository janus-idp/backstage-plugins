import React from 'react';

import { Content, InfoCard, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import { Grid, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment';

import { ProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../../constants';
import { executeWorkflowRouteRef } from '../../routes';
import { capitalize } from '../../utils/StringUtils';
import { EditorViewKind, WorkflowEditor } from '../WorkflowEditor';
import { ProcessInstanceStatus } from './ProcessInstanceStatus';
import { WorkflowRunDetail, WorkflowSuggestion } from './WorkflowRunDetail';

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

  const nextWorkflowSuggestions: WorkflowRunDetail['nextWorkflowSuggestions'] =
    // @ts-ignore
    variables?.workflowdata?.workflowOptions;

  return {
    id: instance.id,
    name,
    workflow: name,
    started: start.toDate().toLocaleString(),
    duration: duration.humanize(),
    category: instance.category,
    status: instance.state,
    description: instance.description,
    nextWorkflowSuggestions,
  };
};

const useStyles = makeStyles(_ => ({
  card: {
    height: '100%',
  },
}));

export const WorkflowInstancePageContent = ({
  processInstance,
}: {
  processInstance?: ProcessInstance;
}) => {
  const styles = useStyles();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  if (!processInstance) {
    return <Skeleton />;
  }

  const details = mapProcessInstanceToDetails(processInstance);

  const detailLabelValues = [
    {
      label: 'Category',
      value: capitalize(details.category ?? VALUE_UNAVAILABLE),
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

  if (details.nextWorkflowSuggestions) {
    Object.entries(details.nextWorkflowSuggestions).forEach(([_, value]) => {
      const nextWorkflowSuggestions: WorkflowSuggestion[] = Array.isArray(value)
        ? value
        : [value];
      nextWorkflowSuggestions.forEach(nextWorkflowSuggestion => {
        // Produce flat structure
        nextWorkflows.push({
          title: nextWorkflowSuggestion.name,
          link: executeWorkflowLink({ workflowId: nextWorkflowSuggestion.id }),
        });
      });
    });
  }

  return (
    <Content noPadding>
      <Grid container>
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

        <Grid item xs={6}>
          <InfoCard title="Results" divider={false} className={styles.card}>
            <Grid container spacing={3}>
              {nextWorkflows.map(item => (
                <Grid item xs={4} key={item.title}>
                  <Link to={item.link}>{item.title}</Link>
                </Grid>
              ))}
            </Grid>
          </InfoCard>
        </Grid>

        <Grid item xs={12}>
          <InfoCard
            title="Workflow definition"
            divider={false}
            className={styles.card}
          >
            <WorkflowEditor
              workflowId={processInstance.description}
              kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
            />
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard title="Timeline" divider={false} className={styles.card} />
        </Grid>

        <Grid item xs={6}>
          <InfoCard title="Variables" divider={false} className={styles.card} />
        </Grid>
      </Grid>
    </Content>
  );
};
