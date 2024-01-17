import React from 'react';

import { Content, InfoCard, Link } from '@backstage/core-components';
import { PathParams, RouteFunc, useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import { Grid, makeStyles } from '@material-ui/core';
import moment from 'moment';

import {
  ProcessInstance,
  ProcessInstanceStateValues,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef, workflowInstanceRouteRef } from '../routes';
import { capitalize } from '../utils/StringUtils';
import { EditorViewKind, WorkflowEditor } from './WorkflowEditor';
import { WorkflowInstanceStatusIndicator } from './WorkflowInstanceStatusIndicator';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowRunDetail, WorkflowSuggestion } from './WorkflowRunDetail';
import { WorkflowVariablesViewer } from './WorkflowVariablesViewer';

export const mapProcessInstanceToDetails = (
  instance: ProcessInstance,
): WorkflowRunDetail => {
  const start = moment(instance.start);
  const end = moment(instance.end?.toString());
  const duration = moment.duration(start.diff(end));
  const name = instance.processName || instance.processId;
  const businessKey = instance.businessKey;

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
    businessKey,
  };
};

const getNextWorkflows = (
  details: WorkflowRunDetail,
  executeWorkflowLink: RouteFunc<
    PathParams<'/next/workflows/:workflowId/execute'>
  >,
) => {
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

  return nextWorkflows;
};

const useStyles = makeStyles(_ => ({
  topRowCard: {
    height: '252px',
  },
  middleRowCard: {
    height: 'calc(2 * 252px)',
  },
  bottomRowCard: {
    height: '100%',
  },
  autoOverflow: { overflow: 'auto' },
}));

export const WorkflowInstancePageContent: React.FC<{
  processInstance: ProcessInstance;
}> = ({ processInstance }) => {
  const styles = useStyles();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);
  const details = React.useMemo(
    () => mapProcessInstanceToDetails(processInstance),
    [processInstance],
  );
  const detailLabelValues = React.useMemo(() => {
    const labelsAndValues = [
      {
        label: 'Status',
        value: (
          <WorkflowInstanceStatusIndicator
            status={details.status as ProcessInstanceStateValues}
          />
        ),
      },
      { label: 'Started', value: details.started },
      { label: 'ID', value: details.id },
      {
        label: 'Category',
        value: capitalize(details.category ?? VALUE_UNAVAILABLE),
      },
      { label: 'Duration', value: details.duration },
      { label: 'Description', value: details.description },
    ];

    if (details.businessKey) {
      labelsAndValues.push({
        label: 'Assessed by',
        value: (
          <Link to={workflowInstanceLink({ instanceId: details.businessKey })}>
            {details.businessKey}
          </Link>
        ),
      });
    }

    return labelsAndValues;
  }, [
    details.businessKey,
    details.category,
    details.description,
    details.duration,
    details.id,
    details.started,
    details.status,
    workflowInstanceLink,
  ]);

  const nextWorkflows = React.useMemo(
    () => getNextWorkflows(details, executeWorkflowLink),
    [details, executeWorkflowLink],
  );

  return (
    <Content noPadding>
      <Grid container>
        <Grid item xs={6}>
          <InfoCard
            title="Details"
            divider={false}
            className={styles.topRowCard}
          >
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
          <InfoCard
            title="Results"
            divider={false}
            className={styles.topRowCard}
            cardClassName={styles.autoOverflow}
          >
            {nextWorkflows.length === 0 ? (
              <WorkflowVariablesViewer variables={processInstance.variables} />
            ) : (
              <Grid container spacing={3}>
                {nextWorkflows.map(item => (
                  <Grid item xs={4} key={item.title}>
                    <Link to={item.link}>{item.title}</Link>
                  </Grid>
                ))}
              </Grid>
            )}
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard
            title="Workflow definition"
            className={styles.middleRowCard}
          >
            <WorkflowEditor
              workflowId={processInstance.processId}
              kind={EditorViewKind.DIAGRAM_VIEWER}
              editorMode="text"
              readonly
            />
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard
            title="Workflow progress"
            divider={false}
            className={styles.middleRowCard}
            cardClassName={styles.autoOverflow}
          >
            <WorkflowProgress
              workflowError={processInstance.error}
              workflowNodes={processInstance.nodes}
              workflowStatus={processInstance.state}
            />
          </InfoCard>
        </Grid>

        {nextWorkflows.length > 0 ? (
          <Grid item xs={12}>
            <InfoCard
              title="Variables"
              className={styles.bottomRowCard}
              cardClassName={styles.autoOverflow}
            >
              <WorkflowVariablesViewer variables={processInstance.variables} />
            </InfoCard>
          </Grid>
        ) : null}
      </Grid>
    </Content>
  );
};
WorkflowInstancePageContent.displayName = 'WorkflowInstancePageContent';
