import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { InfoCard, Progress } from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import { Button, Grid, Typography } from '@material-ui/core';

import { WorkflowDataInputSchemaResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';

export interface ExecuteWorkflowPageProps {
  initialState?: Record<string, JsonValue>;
}

export const ExecuteWorkflowPage = (props: ExecuteWorkflowPageProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const [isExecuting, setIsExecuting] = useState(false);

  const [formState] = useState(props.initialState);

  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);

  const { value, error, loading } =
    useAsync(async (): Promise<WorkflowDataInputSchemaResponse> => {
      const response =
        await orchestratorApi.getWorkflowDataInputSchema(workflowId);
      return response;
    }, [orchestratorApi, workflowId]);

  const isReady = useMemo(() => !loading && !error, [loading, error]);

  const handleExecute = useCallback(async () => {
    const parameters: Record<string, JsonValue> = {};
    if (value?.schema && formState) {
      for (const key of Object.keys(formState)) {
        const property = formState[key];
        Object.assign(parameters, property);
      }
    }

    setIsExecuting(true);
    try {
      const response = await orchestratorApi.executeWorkflow({
        workflowId,
        parameters,
      });
      navigate(instanceLink({ instanceId: response.id }));
    } catch (err) {
      // eslint-disable-next-line
      console.error(err);
    }
    setIsExecuting(false);
  }, [formState, instanceLink, navigate, orchestratorApi, value, workflowId]);

  const executeButton = useMemo(
    () => (
      <Button variant="contained" color="primary" onClick={handleExecute}>
        Execute
      </Button>
    ),
    [handleExecute],
  );

  return (
    <BaseOrchestratorPage title="Execute">
      {loading || (isExecuting && <Progress />)}
      {isReady && (
        <InfoCard title={value?.workflowItem.definition.name ?? workflowId}>
          {/* The multi-step form should be here */}
          {value?.schema ? (
            <>{executeButton}</>
          ) : (
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography>
                  No data input schema found for this workflow
                </Typography>
              </Grid>
              <Grid item>{executeButton}</Grid>
            </Grid>
          )}
        </InfoCard>
      )}
    </BaseOrchestratorPage>
  );
};
