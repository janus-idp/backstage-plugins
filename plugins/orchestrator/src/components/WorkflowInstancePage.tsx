import React from 'react';
import { useAsyncRetry } from 'react-use';

import {
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import { orchestratorApiRef } from '../api';
import { workflowInstanceRouteRef } from '../routes';
import { isNonNullable } from '../utils/TypeGuards';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';
import { WorkflowInstancePageContent } from './WorkflowInstancePageContent';

export const WorkflowInstancePage = ({
  instanceId,
}: {
  instanceId?: string;
}) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { instanceId: queryInstanceId } = useRouteRefParams(
    workflowInstanceRouteRef,
  );

  const { loading, error, value, retry } = useAsyncRetry(async () => {
    if (!instanceId && !queryInstanceId) {
      return undefined;
    }
    return await orchestratorApi.getInstance(instanceId || queryInstanceId);
  }, [orchestratorApi, queryInstanceId]);

  const isReady = React.useMemo(() => !loading && !error, [loading, error]);

  const handleAbort = React.useCallback(async () => {
    if (value) {
      // eslint-disable-next-line no-alert
      const yes = window.confirm(
        'Are you sure you want to abort this instance?',
      );

      if (yes) {
        try {
          await orchestratorApi.abortWorkflow(value.id);
          retry();
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
  }, [orchestratorApi, retry, value]);

  return (
    <BaseOrchestratorPage
      title={value?.processId ?? value?.id ?? instanceId}
      type="Workflow runs"
      typeLink="/orchestrator/instances"
    >
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {isReady && isNonNullable(value) ? (
        <>
          <ContentHeader title="">
            <Grid container item justifyContent="flex-end" spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={value?.state !== 'ACTIVE'}
                  onClick={value?.state === 'ACTIVE' ? handleAbort : undefined}
                >
                  Abort
                </Button>
              </Grid>
            </Grid>
          </ContentHeader>
          <WorkflowInstancePageContent processInstance={value} />
        </>
      ) : null}
    </BaseOrchestratorPage>
  );
};
WorkflowInstancePage.displayName = 'WorkflowInstancePage';
