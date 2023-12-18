import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { FeatureFlagged } from '@backstage/core-app-api';
import { InfoCard } from '@backstage/core-components';
import {
  featureFlagsApiRef,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { FEATURE_FLAG_DEVELOPER_MODE } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../next/BaseOrchestratorPage';
import { EditorViewKind, WorkflowEditor } from '../WorkflowEditor';
import WorkflowDefinitionDetailsCard from './WorkflowDefinitionDetailsCard';

export const WorkflowDefinitionViewerPage = () => {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const { workflowId, format } = useRouteRefParams(workflowDefinitionsRouteRef);
  const orchestratorApi = useApi(orchestratorApiRef);
  const { value: workflowOverview } = useAsync(() =>
    orchestratorApi.getWorkflowOverview(workflowId),
  );
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const editWorkflowLink = useRouteRef(editWorkflowRouteRef);
  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );
  const isDeveloperModeOn = featureFlagsApi.isActive(
    FEATURE_FLAG_DEVELOPER_MODE,
  );

  const handleExecute = () => {
    navigate(executeWorkflowLink({ workflowId }));
  };

  const handleEdit = () => {
    navigate(editWorkflowLink({ workflowId, format }));
  };

  const loading = !workflowOverview;

  return (
    <BaseOrchestratorPage
      title={workflowOverview?.name || workflowId}
      type="workflows"
      typeLink="/orchestrator"
    >
      <Grid container spacing={2} direction="column" wrap="nowrap">
        <Grid container item justifyContent="flex-end" spacing={1}>
          <Grid item>
            <FeatureFlagged with={FEATURE_FLAG_DEVELOPER_MODE}>
              {loading ? (
                <Skeleton variant="text" width="5rem" />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              )}
            </FeatureFlagged>
          </Grid>
          <Grid item>
            {loading ? (
              <Skeleton variant="text" width="5rem" />
            ) : (
              <Button
                variant={isDeveloperModeOn ? 'outlined' : 'contained'}
                color="primary"
                onClick={handleExecute}
              >
                Run
              </Button>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <WorkflowDefinitionDetailsCard workflowOverview={workflowOverview} />
        </Grid>
        <Grid item>
          <InfoCard title="Workflow definition">
            <div style={{ height: '600px' }}>
              <WorkflowEditor
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                workflowId={workflowId}
                format={workflowFormat}
              />
            </div>
          </InfoCard>
        </Grid>
      </Grid>
    </BaseOrchestratorPage>
  );
};
