import React from 'react';

import { Content, InfoCard } from '@backstage/core-components';

import { Grid, makeStyles } from '@material-ui/core';
import moment from 'moment';

import {
  AssessedProcessInstanceDTO,
  ProcessInstanceDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { EditorViewKind, WorkflowEditor } from './WorkflowEditor';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowResult } from './WorkflowResult';
import { WorkflowRunDetail } from './WorkflowRunDetail';
import { WorkflowRunDetails } from './WorkflowRunDetails';
import { WorkflowVariablesViewer } from './WorkflowVariablesViewer';

export const mapProcessInstanceToDetails = (
  instance: ProcessInstanceDTO,
): WorkflowRunDetail => {
  const name = instance.processName || instance.processId;
  const start = instance.start ? moment(instance.start) : undefined;
  let duration: string = VALUE_UNAVAILABLE;
  if (start && instance.end) {
    const end = moment(instance.end);
    duration = moment.duration(start.diff(end)).humanize();
  }

  const started = start?.toDate().toLocaleString() ?? VALUE_UNAVAILABLE;

  return {
    id: instance.id,
    name,
    workflowId: instance.processId,
    started,
    duration,
    category: instance.category,
    status: instance.status,
    description: instance.description,
    businessKey: instance.businessKey,
  };
};

const useStyles = makeStyles(_ => ({
  topRowCard: {
    height: '20rem',
  },
  middleRowCard: {
    height: '20rem',
    overflow: 'auto',
    wordBreak: 'break-word',
  },
  bottomRowCard: {
    minHeight: '40rem',
    height: '100%',
  },
  autoOverflow: { overflow: 'auto' },
  recommendedLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  recommendedLabel: { margin: '0 0.25rem' },
}));

export const WorkflowInstancePageContent: React.FC<{
  assessedInstance: AssessedProcessInstanceDTO;
}> = ({ assessedInstance }) => {
  const styles = useStyles();

  const details = React.useMemo(
    () => mapProcessInstanceToDetails(assessedInstance.instance),
    [assessedInstance.instance],
  );

  const workflowdata = assessedInstance.instance?.workflowdata;
  let instanceVariables;
  if (workflowdata) {
    instanceVariables = {
      /* Since we are about to remove just the top-level property, shallow copy of the object is sufficient */
      ...workflowdata,
    };
    if (instanceVariables.hasOwnProperty('result')) {
      delete instanceVariables.result;
    }
  }

  return (
    <Content noPadding>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InfoCard
            title="Details"
            divider={false}
            className={styles.topRowCard}
          >
            <WorkflowRunDetails
              details={details}
              assessedBy={assessedInstance.assessedBy}
              completedWith={workflowdata?.result?.completedWith}
            />
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard
            title="Variables"
            divider={false}
            className={styles.middleRowCard}
            cardClassName={styles.autoOverflow}
          >
            {instanceVariables && (
              <WorkflowVariablesViewer variables={instanceVariables} />
            )}
            {!instanceVariables && (
              <div>The workflow instance has no variables</div>
            )}
          </InfoCard>
        </Grid>
        <Grid item xs={6}>
          <WorkflowResult
            assessedInstance={assessedInstance}
            className={styles.middleRowCard}
          />
        </Grid>

        <Grid item xs={6}>
          <InfoCard
            title="Workflow definition"
            divider={false}
            className={styles.bottomRowCard}
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
            className={styles.bottomRowCard}
            cardClassName={styles.autoOverflow}
          >
            <WorkflowProgress
              workflowError={assessedInstance.instance.error}
              workflowNodes={assessedInstance.instance.nodes}
              workflowStatus={assessedInstance.instance.status}
            />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  );
};
WorkflowInstancePageContent.displayName = 'WorkflowInstancePageContent';
