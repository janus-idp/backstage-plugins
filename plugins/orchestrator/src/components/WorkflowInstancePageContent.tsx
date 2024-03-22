import React from 'react';

import { Content, InfoCard, Link } from '@backstage/core-components';
import {
  PathParams,
  RouteFunc,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';

import { Grid, makeStyles } from '@material-ui/core';
import moment from 'moment';

import {
  AssessedProcessInstance,
  parseWorkflowVariables,
  ProcessInstance,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef } from '../routes';
import { buildUrl } from '../utils/UrlUtils';
import { WorkflowDescriptionModal } from './WorkflowDescriptionModal';
import { EditorViewKind, WorkflowEditor } from './WorkflowEditor';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowRunDetail, WorkflowSuggestion } from './WorkflowRunDetail';
import { WorkflowRunDetails } from './WorkflowRunDetails';
import { WorkflowVariablesViewer } from './WorkflowVariablesViewer';

export const mapProcessInstanceToDetails = (
  instance: ProcessInstance,
): WorkflowRunDetail => {
  const name = instance.processName || instance.processId;
  const start = instance.start ? moment(instance.start) : undefined;
  let duration: string = VALUE_UNAVAILABLE;
  if (start && instance.end) {
    const end = moment(instance.end);
    duration = moment.duration(start.diff(end)).humanize();
  }

  const started = start?.toDate().toLocaleString() ?? VALUE_UNAVAILABLE;
  const variables = parseWorkflowVariables(instance?.variables);
  const nextWorkflowSuggestions: WorkflowRunDetail['nextWorkflowSuggestions'] =
    // @ts-ignore
    variables?.workflowdata?.workflowOptions;

  return {
    id: instance.id,
    name,
    workflowId: instance.processId,
    started,
    duration,
    category: instance.category,
    status: instance.state,
    description: instance.description,
    nextWorkflowSuggestions,
    businessKey: instance.businessKey,
  };
};

const useStyles = makeStyles(_ => ({
  topRowCard: {
    height: '20rem',
  },
  middleRowCard: {
    height: 'calc(2 * 20rem)',
  },
  bottomRowCard: {
    height: '100%',
  },
  autoOverflow: { overflow: 'auto' },
}));

const getNextWorkflows = (
  details: WorkflowRunDetail,
  executeWorkflowLink: RouteFunc<PathParams<'/workflows/:workflowId/execute'>>,
) => {
  const nextWorkflows: { title: string; link: string; id: string }[] = [];

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
          id: nextWorkflowSuggestion.id,
        });
      });
    });
  }

  return nextWorkflows;
};

export const WorkflowInstancePageContent: React.FC<{
  assessedInstance: AssessedProcessInstance;
}> = ({ assessedInstance }) => {
  const styles = useStyles();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const details = React.useMemo(
    () => mapProcessInstanceToDetails(assessedInstance.instance),
    [assessedInstance.instance],
  );
  const orchestratorApi = useApi(orchestratorApiRef);

  const [
    currentOpenedWorkflowDescriptionModalID,
    setCurrentOpenedWorkflowDescriptionModalID,
  ] = React.useState('');
  const [currentWorkflow, setCurrentWorkflow] = React.useState(
    {} as WorkflowOverview,
  );

  const openWorkflowDescriptionModal = (itemId: string) => {
    if (itemId) {
      orchestratorApi
        .getWorkflowOverview(itemId)
        .then(
          workflow => {
            setCurrentWorkflow(workflow);
          },
          error => {
            throw new Error(error);
          },
        )
        .catch(error => {
          throw new Error(error);
        });
      setCurrentOpenedWorkflowDescriptionModalID(itemId);
    }
  };

  const closeWorkflowDescriptionModal = () => {
    setCurrentOpenedWorkflowDescriptionModalID('');
    setCurrentWorkflow({} as WorkflowOverview);
  };

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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InfoCard
            title="Details"
            divider={false}
            className={styles.topRowCard}
          >
            <WorkflowRunDetails
              details={details}
              assessedBy={assessedInstance.assessedBy}
            />
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
                    <Link
                      color="primary"
                      to="#"
                      onClick={() => {
                        openWorkflowDescriptionModal(item.id);
                      }}
                    >
                      {item.title}
                    </Link>
                    <WorkflowDescriptionModal
                      workflow={currentWorkflow}
                      runWorkflowLink={item.link}
                      open={item.id === currentOpenedWorkflowDescriptionModalID}
                      onClose={closeWorkflowDescriptionModal}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard
            title="Workflow definition"
            divider={false}
            className={styles.middleRowCard}
          >
            <WorkflowEditor
              workflowId={assessedInstance.instance.processId}
              kind={EditorViewKind.DIAGRAM_VIEWER}
              editorMode="text"
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
