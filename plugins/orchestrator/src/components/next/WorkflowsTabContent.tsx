import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { FeatureFlagged } from '@backstage/core-app-api';
import {
  Content,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import Button from '@material-ui/core/Button/Button';
import Grid from '@material-ui/core/Grid/Grid';

import {
  FEATURE_FLAG_DEVELOPER_MODE,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { FormattedWorkflowOverview } from '../../dataFormatters/WorkflowOverviewFormatter';
import { newWorkflowRef } from '../../routes';
import EditWorkflowDialog from '../WorkflowDialog/EditWorkflowDialog';
import { WorkflowsTable } from './WorkflowsTable';

export const WorkflowsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const newWorkflowLink = useRouteRef(newWorkflowRef);

  const [forceReload, setForceReload] = React.useState(false);

  const [editModalWorkflow, setEditModalWorkflow] =
    React.useState<FormattedWorkflowOverview>();

  const { value, error, loading } = useAsync(async (): Promise<
    WorkflowOverview[]
  > => {
    const data = await orchestratorApi.listWorkflowsOverview();
    return data.items;
  }, [forceReload]);

  const isReady = React.useMemo(() => !loading && !error, [loading, error]);

  // wrap with useCallback since WorkflowsTable has useMemo with onEdit prop as a dependency
  const handleEdit = React.useCallback(
    (workflowOverview: FormattedWorkflowOverview) => {
      setEditModalWorkflow(workflowOverview);
    },
    [],
  );

  return (
    <Content noPadding>
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {isReady ? (
        <>
          <FeatureFlagged with={FEATURE_FLAG_DEVELOPER_MODE}>
            <Grid container direction="row-reverse">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(newWorkflowLink())}
                >
                  Create new
                </Button>
              </Grid>
            </Grid>
          </FeatureFlagged>
          <Grid container direction="column">
            <Grid item>
              <WorkflowsTable items={value ?? []} handleEdit={handleEdit} />
            </Grid>
          </Grid>
          {editModalWorkflow && (
            <EditWorkflowDialog
              close={() => setEditModalWorkflow(undefined)}
              open={!!editModalWorkflow}
              workflowId={editModalWorkflow.id}
              handleSaveSucceeded={() => {
                setForceReload(!forceReload);
              }}
              name={editModalWorkflow.name}
            />
          )}
        </>
      ) : null}
    </Content>
  );
};
