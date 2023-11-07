import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import {
  workflow_title,
  WorkflowItem,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { newWorkflowRef, workflowInstancesRouteRef } from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { WorkflowsTable } from '../WorkflowDefinitionsListComponent/WorkflowDefinitionsListComponent';

export const OrchestratorPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const newWorkflowLink = useRouteRef(newWorkflowRef);
  const instancesLink = useRouteRef(workflowInstancesRouteRef);

  const { value, error, loading } = useAsync(async (): Promise<
    WorkflowItem[]
  > => {
    const data = await orchestratorApi.listWorkflows();
    return data.items;
  }, []);

  const isReady = useMemo(() => !loading && !error, [loading, error]);

  return (
    <BaseOrchestratorPage>
      <ContentHeader title="Definitions">
        {isReady && (
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
              <OrchestratorSupportButton />
            </Grid>
          </Grid>
        )}
      </ContentHeader>
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {isReady && (
        <Grid container spacing={3} direction="column">
          <Grid item>
            <WorkflowsTable items={value ?? []} />
          </Grid>
        </Grid>
      )}
    </BaseOrchestratorPage>
  );
};
