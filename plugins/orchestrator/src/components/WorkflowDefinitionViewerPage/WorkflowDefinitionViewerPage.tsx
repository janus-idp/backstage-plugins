import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { FeatureFlagged } from '@backstage/core-app-api';
import { InfoCard, ResponseErrorPanel } from '@backstage/core-components';
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
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../next/BaseOrchestratorPage';
import EditWorkflowDialog from '../WorkflowDialog/EditWorkflowDialog';
import { EditorViewKind, WorkflowEditor } from '../WorkflowEditor';
import WorkflowDefinitionDetailsCard from './WorkflowDefinitionDetailsCard';

export const WorkflowDefinitionViewerPage = () => {
  const featureFlagsApi = useApi(featureFlagsApiRef);
  const { workflowId, format } = useRouteRefParams(workflowDefinitionsRouteRef);
  const orchestratorApi = useApi(orchestratorApiRef);
  const [forceReload, setForceReload] = React.useState(false);
  const {
    value: workflowOverview,
    loading,
    error,
  } = useAsync(() => {
    return orchestratorApi.getWorkflowOverview(workflowId);
  }, [forceReload]);
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const [editModalOpen, setEditModalOpen] = React.useState(false);

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
    setEditModalOpen(true);
  };

  return (
    <BaseOrchestratorPage
      title={workflowOverview?.name || workflowId}
      type="workflows"
      typeLink="/orchestrator"
    >
      <Grid container spacing={2} direction="column" wrap="nowrap">
        {error && (
          <Grid item>
            <ResponseErrorPanel error={error} />
          </Grid>
        )}
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
          <WorkflowDefinitionDetailsCard
            workflowOverview={workflowOverview}
            loading={loading}
          />
        </Grid>
        <Grid item>
          <InfoCard title="Workflow definition">
            <div style={{ height: '600px' }}>
              <WorkflowEditor
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                workflowId={workflowId}
                format={workflowFormat}
                forceReload={forceReload}
              />
            </div>
          </InfoCard>
        </Grid>
      </Grid>
      {editModalOpen && (
        <EditWorkflowDialog
          close={() => setEditModalOpen(false)}
          open={editModalOpen}
          workflowId={workflowId}
          handleSaveSucceeded={() => {
            setForceReload(!forceReload);
          }}
          name={workflowOverview?.name || ''}
        />
      )}
    </BaseOrchestratorPage>
  );
};
