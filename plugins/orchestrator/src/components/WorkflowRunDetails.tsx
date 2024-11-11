import React from 'react';

import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import { Grid, makeStyles, Typography } from '@material-ui/core';

import {
  capitalize,
  ProcessInstanceDTO,
  ProcessInstanceStatusDTO,
  WorkflowResultDTOCompletedWithEnum,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { workflowInstanceRouteRef } from '../routes';
import { WorkflowInstanceStatusIndicator } from './WorkflowInstanceStatusIndicator';
import { WorkflowRunDetail } from './WorkflowRunDetail';

type WorkflowDetailsCardProps = {
  assessedBy?: ProcessInstanceDTO;
  details: WorkflowRunDetail;
  completedWith?: WorkflowResultDTOCompletedWithEnum;
};

const useStyles = makeStyles({
  root: {
    overflowY: 'auto',
    height: '15rem',
  },
});

export const WorkflowRunDetails: React.FC<WorkflowDetailsCardProps> = ({
  assessedBy,
  details,
  completedWith,
}) => {
  const styles = useStyles();
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);

  return (
    <Grid container className={styles.root} alignContent="flex-start">
      <Grid item md={4} key="Category">
        <AboutField label="Category">
          <Typography variant="subtitle2" component="div">
            <b>{capitalize(details.category ?? VALUE_UNAVAILABLE)}</b>
          </Typography>
        </AboutField>
      </Grid>
      <Grid item md={4} key="Status">
        <AboutField label="Status">
          <Typography variant="subtitle2" component="div">
            <b>
              <WorkflowInstanceStatusIndicator
                status={details.status as ProcessInstanceStatusDTO}
                completedWith={completedWith}
              />
            </b>
          </Typography>
        </AboutField>
      </Grid>
      <Grid item md={4} key="Duration">
        <AboutField label="Duration">
          <Typography variant="subtitle2" component="div">
            <b>{details.duration}</b>
          </Typography>
        </AboutField>
      </Grid>

      <Grid item md={8} key="ID">
        <AboutField label="ID">
          <Typography variant="subtitle2" component="div">
            <b>{details.id}</b>
          </Typography>
        </AboutField>
      </Grid>
      <Grid item md={4} key="Started">
        <AboutField label="Started">
          <Typography variant="subtitle2" component="div">
            <b>{details.started}</b>
          </Typography>
        </AboutField>
      </Grid>

      {assessedBy ? (
        <Grid item md={12} key="Assessed by">
          <AboutField label="Assessed by">
            <Typography variant="subtitle2" component="div">
              <b>
                <Link
                  to={workflowInstanceLink({
                    instanceId: assessedBy.id,
                  })}
                >
                  {assessedBy.processName}
                </Link>
              </b>
            </Typography>
          </AboutField>
        </Grid>
      ) : null}

      <Grid item md={12} key="Description">
        <AboutField label="Description">
          <Typography variant="subtitle2" component="div">
            <b>{details.description ?? VALUE_UNAVAILABLE}</b>
          </Typography>
        </AboutField>
      </Grid>
    </Grid>
  );
};
WorkflowRunDetails.displayName = 'WorkflowDetails';
