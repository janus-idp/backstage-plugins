import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import {
  AssessedProcessInstance,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_INSTANCE_ID,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { SHORT_REFRESH_INTERVAL } from '../constants';
import usePolling from '../hooks/usePolling';
import { executeWorkflowRouteRef, workflowInstanceRouteRef } from '../routes';
import { isNonNullable } from '../utils/TypeGuards';
import { buildUrl } from '../utils/UrlUtils';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';
import { InfoDialog } from './InfoDialog';
import { WorkflowInstancePageContent } from './WorkflowInstancePageContent';

export type AbortConfirmationDialogActionsProps = {
  handleSubmit: () => void;
  handleCancel: () => void;
};

const AbortConfirmationDialogContent = () => (
  <div>Are you sure you want to abort this workflow instance?</div>
);

const AbortConfirmationDialogActions = (
  props: AbortConfirmationDialogActionsProps,
) => (
  <>
    <Button onClick={props.handleCancel}>Cancel</Button>
    <Button onClick={props.handleSubmit} color="primary">
      Ok
    </Button>
  </>
);

export const WorkflowInstancePage = ({
  instanceId,
}: {
  instanceId?: string;
}) => {
  const navigate = useNavigate();
  const orchestratorApi = useApi(orchestratorApiRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const { instanceId: queryInstanceId } = useRouteRefParams(
    workflowInstanceRouteRef,
  );
  const [isAbortConfirmationDialogOpen, setIsAbortConfirmationDialogOpen] =
    useState(false);

  const fetchInstance = React.useCallback(async () => {
    if (!instanceId && !queryInstanceId) {
      return undefined;
    }
    return await orchestratorApi.getInstance(
      instanceId ?? queryInstanceId,
      true,
    );
  }, [instanceId, orchestratorApi, queryInstanceId]);

  const { loading, error, value, restart } = usePolling<
    AssessedProcessInstance | undefined
  >(
    fetchInstance,
    SHORT_REFRESH_INTERVAL,
    (curValue: AssessedProcessInstance | undefined) =>
      !!curValue && curValue.instance.state === 'ACTIVE',
  );

  const canAbort = React.useMemo(
    () =>
      value?.instance.state === 'ACTIVE' || value?.instance.state === 'ERROR',
    [value],
  );

  const canRerun = React.useMemo(
    () =>
      value?.instance.state === 'COMPLETED' ||
      value?.instance.state === 'ABORTED',
    [value],
  );

  const toggleAbortConfirmationDialog = () => {
    setIsAbortConfirmationDialogOpen(!isAbortConfirmationDialogOpen);
  };

  const handleAbort = React.useCallback(async () => {
    if (value) {
      try {
        await orchestratorApi.abortWorkflow(value.instance.id);
        restart();
      } catch (e) {
        // eslint-disable-next-line no-alert
        window.alert(
          `The abort operation failed with the following error: ${
            (e as Error).message
          }`,
        );
      }
      setIsAbortConfirmationDialogOpen(false);
    }
  }, [orchestratorApi, restart, value]);

  const handleRerun = React.useCallback(() => {
    if (!value) {
      return;
    }
    const routeUrl = executeWorkflowLink({
      workflowId: value.instance.processId,
    });

    const urlToNavigate = buildUrl(routeUrl, {
      [QUERY_PARAM_INSTANCE_ID]: value.instance.id,
      [QUERY_PARAM_ASSESSMENT_INSTANCE_ID]: value.assessedBy?.id,
    });
    navigate(urlToNavigate);
  }, [value, navigate, executeWorkflowLink]);

  return (
    <BaseOrchestratorPage
      title={value?.instance.processId ?? value?.instance.id ?? instanceId}
      type="Workflow runs"
      typeLink="/orchestrator/instances"
    >
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {!loading && isNonNullable(value) ? (
        <>
          <ContentHeader title="">
            <InfoDialog
              title="Abort workflow"
              onClose={toggleAbortConfirmationDialog}
              open={isAbortConfirmationDialogOpen}
              dialogActions={
                <AbortConfirmationDialogActions
                  handleCancel={toggleAbortConfirmationDialog}
                  handleSubmit={handleAbort}
                />
              }
              children={<AbortConfirmationDialogContent />}
            />
            <Grid container item justifyContent="flex-end" spacing={1}>
              {!canRerun && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={!canAbort}
                    onClick={
                      canAbort ? toggleAbortConfirmationDialog : undefined
                    }
                  >
                    Abort
                  </Button>
                </Grid>
              )}
              {!canAbort && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!canRerun}
                    onClick={canRerun ? handleRerun : undefined}
                  >
                    Rerun
                  </Button>
                </Grid>
              )}
            </Grid>
          </ContentHeader>
          <WorkflowInstancePageContent assessedInstance={value} />
        </>
      ) : null}
    </BaseOrchestratorPage>
  );
};
WorkflowInstancePage.displayName = 'WorkflowInstancePage';
