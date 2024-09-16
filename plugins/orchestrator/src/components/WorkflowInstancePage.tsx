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

import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Theme,
} from '@material-ui/core';

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

export type AbortAlertDialogActionsProps = {
  handleClose: () => void;
};

export type AbortAlertDialogContentProps = {
  message: string;
};

const AbortConfirmationDialogContent = () => (
  <div>Are you sure you want to abort this workflow instance?</div>
);

const AbortAlertDialogContent = (props: AbortAlertDialogContentProps) => (
  <div>
    The abort operation failed with the following error: {props.message}
  </div>
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

const AbortAlertDialogActions = (props: AbortAlertDialogActionsProps) => (
  <Button onClick={props.handleClose} color="primary">
    OK
  </Button>
);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    abortButton: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.getContrastText(theme.palette.error.main),
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
  }),
);

export const WorkflowInstancePage = ({
  instanceId,
}: {
  instanceId?: string;
}) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const orchestratorApi = useApi(orchestratorApiRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const { instanceId: queryInstanceId } = useRouteRefParams(
    workflowInstanceRouteRef,
  );
  const [isAbortConfirmationDialogOpen, setIsAbortConfirmationDialogOpen] =
    useState(false);
  const [isAbortAlertDialogOpen, setIsAbortAlertDialogOpen] = useState(false);
  const [abortWorkflowInstanceErrorMsg, setAbortWorkflowInstanceErrorMsg] =
    useState('');

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
      !!curValue &&
      (curValue.instance.state === 'ACTIVE' ||
        curValue.instance.state === 'PENDING' ||
        !curValue.instance.state),
  );

  const isErrorState = value?.instance.state === 'ERROR';

  const canAbort = value?.instance.state === 'ACTIVE' || isErrorState;

  const canRerun = React.useMemo(
    () =>
      value?.instance.state === 'COMPLETED' ||
      value?.instance.state === 'ABORTED' ||
      value?.instance.state === 'ERROR',
    [value],
  );

  const toggleAbortConfirmationDialog = () => {
    setIsAbortConfirmationDialogOpen(!isAbortConfirmationDialogOpen);
  };

  const toggleAbortAlertDialog = () => {
    setIsAbortAlertDialogOpen(!isAbortAlertDialogOpen);
  };

  const handleAbort = React.useCallback(async () => {
    if (value) {
      try {
        await orchestratorApi.abortWorkflowInstance(value.instance.id);
        restart();
      } catch (e) {
        setAbortWorkflowInstanceErrorMsg(`${(e as Error).message}`);
        setIsAbortAlertDialogOpen(true);
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
            <InfoDialog
              title="Abort workflow failed"
              onClose={toggleAbortAlertDialog}
              open={isAbortAlertDialogOpen}
              dialogActions={
                <AbortAlertDialogActions handleClose={toggleAbortAlertDialog} />
              }
              children={
                <AbortAlertDialogContent
                  message={abortWorkflowInstanceErrorMsg}
                />
              }
            />
            <Grid container item justifyContent="flex-end" spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  disabled={!canAbort}
                  onClick={toggleAbortConfirmationDialog}
                  className={classes.abortButton}
                >
                  Abort
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!canRerun}
                  onClick={handleRerun}
                >
                  Rerun
                </Button>
              </Grid>
            </Grid>
          </ContentHeader>
          <WorkflowInstancePageContent assessedInstance={value} />
        </>
      ) : null}
    </BaseOrchestratorPage>
  );
};
WorkflowInstancePage.displayName = 'WorkflowInstancePage';
