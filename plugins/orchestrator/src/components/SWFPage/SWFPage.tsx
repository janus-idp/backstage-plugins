import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentHeader } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import { workflow_title } from '@janus-idp/backstage-plugin-orchestrator-common';

import { newWorkflowRef, swfInstancesRouteRef } from '../../routes';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';
import { SWFDefinitionsListComponent } from '../SWFDefinitionsListComponent';
import { WorkflowSupportButton } from '../WorkflowSupportButton/WorkflowSupportButton';

export const SWFPage = () => {
  const navigate = useNavigate();
  const newWorkflowLink = useRouteRef(newWorkflowRef);
  const instancesLink = useRouteRef(swfInstancesRouteRef);

  return (
    <BaseWorkflowPage>
      <ContentHeader title="Definitions">
        <Grid container spacing={1}>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(newWorkflowLink())}
            >
              {`New ${workflow_title}`}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(instancesLink())}
            >
              View Instances
            </Button>
          </Grid>
          <Grid item>
            <WorkflowSupportButton />
          </Grid>
        </Grid>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <SWFDefinitionsListComponent />
        </Grid>
      </Grid>
    </BaseWorkflowPage>
  );
};
