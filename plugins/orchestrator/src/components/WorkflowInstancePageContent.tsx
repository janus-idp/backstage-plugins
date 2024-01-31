import React from 'react';

import { Content, InfoCard, Link } from '@backstage/core-components';
import { PathParams, RouteFunc, useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import { Grid, makeStyles } from '@material-ui/core';
import moment from 'moment';

import {
  AssessedProcessInstance,
  parseWorkflowVariables,
  ProcessInstance,
  ProcessInstanceStateValues,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef, workflowInstanceRouteRef } from '../routes';
import { capitalize } from '../utils/StringUtils';
import { buildUrl } from '../utils/UrlUtils';
import { EditorViewKind, WorkflowEditor } from './WorkflowEditor';
import { WorkflowInstanceStatusIndicator } from './WorkflowInstanceStatusIndicator';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowRunDetail, WorkflowSuggestion } from './WorkflowRunDetail';
import { WorkflowVariablesViewer } from './WorkflowVariablesViewer';

export const mapProcessInstanceToDetails = (
  instance: ProcessInstance,
): WorkflowRunDetail => {
  const name = instance.processName || instance.processId;
  const start = moment(instance.start);
  let duration: string = VALUE_UNAVAILABLE;
  if (instance.end) {
    const end = moment(instance.end);
    duration = moment.duration(start.diff(end)).humanize();
  }

  const variables = parseWorkflowVariables(instance?.variables);
  const nextWorkflowSuggestions: WorkflowRunDetail['nextWorkflowSuggestions'] =
    // @ts-ignore
    variables?.workflowdata?.workflowOptions;

  return {
    id: instance.id,
    name,
    workflowId: instance.processId,
    started: start.toDate().toLocaleString(),
    duration,
    category: instance.category,
    status: instance.state,
    description: instance.description,
    nextWorkflowSuggestions,
    businessKey: instance.businessKey,
  };
};

const getNextWorkflows = (
  details: WorkflowRunDetail,
  executeWorkflowLink: RouteFunc<PathParams<'/workflows/:workflowId/execute'>>,
) => {
  const nextWorkflows: { title: string; link: string }[] = [];

  if (details.nextWorkflowSuggestions) {
    Object.entries(details.nextWorkflowSuggestions).forEach(([_, value]) => {
      const nextWorkflowSuggestions: WorkflowSuggestion[] = Array.isArray(value)
        ? value
        : [value];
      nextWorkflowSuggestions.forEach(nextWorkflowSuggestion => {
        // Produce flat structure
        const routeUrl = executeWorkflowLink({
          workflowId: nextWorkflowSuggestion.id,
        });
        const urlToNavigate = buildUrl(routeUrl, {
          [QUERY_PARAM_ASSESSMENT_INSTANCE_ID]: details.id,
        });
        nextWorkflows.push({
          title: nextWorkflowSuggestion.name,
          link: urlToNavigate,
        });
      });
    });
  }

  return nextWorkflows;
};

const useStyles = makeStyles(_ => ({
  topRowCard: {
    height: '258px',
  },
  middleRowCard: {
    height: 'calc(2 * 258px)',
  },
  bottomRowCard: {
    height: '100%',
  },
  autoOverflow: { overflow: 'auto' },
}));

export const WorkflowInstancePageContent: React.FC<{
  assessedInstance: AssessedProcessInstance;
}> = ({ assessedInstance }) => {
  const styles = useStyles();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);
  const details = React.useMemo(
    () => mapProcessInstanceToDetails(assessedInstance.instance),
    [assessedInstance.instance],
  );
  const detailLabelValues = React.useMemo(() => {
    const labelsAndValues = [
      {
        label: 'Category',
        value: capitalize(details.category ?? VALUE_UNAVAILABLE),
      },
      {
        label: 'Status',
        value: (
          <WorkflowInstanceStatusIndicator
            status={details.status as ProcessInstanceStateValues}
          />
        ),
      },
      { label: 'Duration', value: details.duration },
      { label: 'ID', value: details.id },
      { label: 'Started', value: details.started },
      { label: 'Description', value: details.description },
    ];

    if (assessedInstance.assessedBy) {
      labelsAndValues.push({
        label: 'Assessed by',
        value: (
          <Link
            to={workflowInstanceLink({
              instanceId: assessedInstance.assessedBy.id,
            })}
          >
            {assessedInstance.assessedBy.processName}
          </Link>
        ),
      });
    }

    return labelsAndValues;
  }, [
    details.category,
    details.description,
    details.duration,
    details.id,
    details.started,
    details.status,
    workflowInstanceLink,
    assessedInstance,
  ]);

  const nextWorkflows = React.useMemo(
    () => getNextWorkflows(details, executeWorkflowLink),
    [details, executeWorkflowLink],
  );

  const instanceVariables = React.useMemo(
    () => parseWorkflowVariables(assessedInstance.instance.variables),
    [assessedInstance],
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
                <Grid item xs={3} key={item.label}>
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
              <WorkflowVariablesViewer variables={instanceVariables} />
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
              workflowId={assessedInstance.instance.processId}
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
              workflowError={assessedInstance.instance.error}
              workflowNodes={assessedInstance.instance.nodes}
              workflowStatus={assessedInstance.instance.state}
            />
          </InfoCard>
        </Grid>

        {nextWorkflows.length > 0 ? (
          <Grid item xs={12}>
            <InfoCard
              title="Variables"
              divider={false}
              className={styles.bottomRowCard}
              cardClassName={styles.autoOverflow}
            >
              <WorkflowVariablesViewer variables={instanceVariables} />
            </InfoCard>
          </Grid>
        ) : null}
      </Grid>
    </Content>
  );
};
WorkflowInstancePageContent.displayName = 'WorkflowInstancePageContent';
