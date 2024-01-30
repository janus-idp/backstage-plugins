import React from 'react';
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

import { AssessedProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import {
  QUERY_PARAM_ASSESSMENT_ID,
  QUERY_PARAM_INSTANCE_ID,
  SHORT_REFRESH_INTERVAL,
} from '../constants';
import usePolling from '../hooks/usePolling';
import { executeWorkflowRouteRef, workflowInstanceRouteRef } from '../routes';
import { isNonNullable } from '../utils/TypeGuards';
import { buildUrl } from '../utils/UrlUtils';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';
import { WorkflowInstancePageContent } from './WorkflowInstancePageContent';

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

  const handleAbort = React.useCallback(async () => {
    if (value) {
      // eslint-disable-next-line no-alert
      const yes = window.confirm(
        'Are you sure you want to abort this instance?',
      );

      if (yes) {
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
      }
    }
  }, [orchestratorApi, restart, value]);

  const handleRerun = React.useCallback(() => {
    if (!value) {
      return;
    }
    const routeUrl = executeWorkflowLink({
      workflowId: value.instance.processId,
    });

    const queryParams = value.assessedBy
      ? {
          [QUERY_PARAM_INSTANCE_ID]: value.assessedBy.id,
          [QUERY_PARAM_ASSESSMENT_ID]: value.assessedBy.processId,
        }
      : {
          [QUERY_PARAM_INSTANCE_ID]: value.instance.id,
        };

    const urlToNavigate = buildUrl(routeUrl, queryParams);
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
            <Grid container item justifyContent="flex-end" spacing={1}>
              {!canRerun && (
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={!canAbort}
                    onClick={canAbort ? handleAbort : undefined}
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
