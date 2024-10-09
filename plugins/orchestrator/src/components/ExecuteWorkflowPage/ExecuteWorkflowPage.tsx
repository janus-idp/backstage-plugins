import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  useQueryParamState,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import { Grid } from '@material-ui/core';

import {
  InputSchemaResponseDTO,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_INSTANCE_ID,
} from '@janus-idp/backstage-plugin-orchestrator-common';
import { OrchestratorForm } from '@janus-idp/backstage-plugin-orchestrator-form-react';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { getErrorObject } from '../../utils/ErrorUtils';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage';
import JsonTextAreaForm from './JsonTextAreaForm';

export const ExecuteWorkflowPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const [isExecuting, setIsExecuting] = useState(false);
  const [updateError, setUpdateError] = React.useState<Error>();
  const [instanceId] = useQueryParamState<string>(QUERY_PARAM_INSTANCE_ID);
  const [assessmentInstanceId] = useQueryParamState<string>(
    QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  );
  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);
  const {
    value,
    loading,
    error: responseError,
  } = useAsync(async (): Promise<InputSchemaResponseDTO> => {
    const res = await orchestratorApi.getWorkflowDataInputSchema(
      workflowId,
      assessmentInstanceId || instanceId,
    );
    return res.data;
  }, [orchestratorApi, workflowId]);
  const schema = value?.inputSchema;
  const data = value?.data;
  const {
    value: workflowName,
    loading: workflowNameLoading,
    error: workflowNameError,
  } = useAsync(async (): Promise<string> => {
    const res = await orchestratorApi.getWorkflowOverview(workflowId);
    return res.data.name || '';
  }, [orchestratorApi, workflowId]);

  const handleExecute = useCallback(
    async (parameters: JsonObject) => {
      setUpdateError(undefined);
      try {
        setIsExecuting(true);
        const response = await orchestratorApi.executeWorkflow({
          workflowId,
          parameters,
          businessKey: assessmentInstanceId,
        });
        navigate(instanceLink({ instanceId: response.data.id }));
      } catch (err) {
        setUpdateError(getErrorObject(err));
      } finally {
        setIsExecuting(false);
      }
    },
    [orchestratorApi, workflowId, navigate, instanceLink, assessmentInstanceId],
  );

  const error = responseError || workflowNameError;
  let pageContent;

  if (loading || workflowNameLoading) {
    pageContent = <Progress />;
  } else if (error) {
    pageContent = <ResponseErrorPanel error={error} />;
  } else {
    pageContent = (
      <Grid container spacing={2} direction="column" wrap="nowrap">
        {updateError && (
          <Grid item>
            <ResponseErrorPanel error={updateError} />
          </Grid>
        )}
        <Grid item>
          <InfoCard title="Run workflow">
            {!!schema ? (
              <OrchestratorForm
                schema={schema}
                handleExecute={handleExecute}
                isExecuting={isExecuting}
                isDataReadonly={!!assessmentInstanceId}
                data={data}
              />
            ) : (
              <JsonTextAreaForm
                handleExecute={handleExecute}
                isExecuting={isExecuting}
              />
            )}
          </InfoCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <BaseOrchestratorPage
      noPadding={workflowNameLoading}
      title={workflowName}
      type="Workflows"
      typeLink="/orchestrator"
    >
      {pageContent}
    </BaseOrchestratorPage>
  );
};
