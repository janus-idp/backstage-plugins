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

import { WorkflowDataInputSchemaResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  QUERY_PARAM_ASSESSMENT_ID,
  QUERY_PARAM_INSTANCE_ID,
} from '../../constants';
import {
  executeWorkflowRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { getErrorObject } from '../../utils/ErrorUtils';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage';
import JsonTextAreaForm from './JsonTextAreaForm';
import StepperForm from './StepperForm';

export const ExecuteWorkflowPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const [isExecuting, setIsExecuting] = useState(false);
  const [updateError, setUpdateError] = React.useState<Error>();
  const [instanceId] = useQueryParamState<string>(QUERY_PARAM_INSTANCE_ID);
  const [assessmentId] = useQueryParamState<string>(QUERY_PARAM_ASSESSMENT_ID);
  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);
  const {
    value: schemaResponse,
    loading,
    error: responseError,
  } = useAsync(
    async (): Promise<WorkflowDataInputSchemaResponse> =>
      await orchestratorApi.getWorkflowDataInputSchema({
        workflowId,
        instanceId,
      }),
    [orchestratorApi, workflowId],
  );

  const handleExecute = useCallback(
    async (getParameters: () => JsonObject) => {
      setUpdateError(undefined);
      let parameters: JsonObject = {};
      try {
        parameters = getParameters();
      } catch (err) {
        setUpdateError(getErrorObject(err));
        return;
      }
      try {
        const businessKey = instanceId && assessmentId ? instanceId : undefined;
        setIsExecuting(true);
        const response = await orchestratorApi.executeWorkflow({
          workflowId,
          parameters,
          businessKey,
        });
        navigate(instanceLink({ instanceId: response.id }));
      } catch (err) {
        setUpdateError(getErrorObject(err));
      } finally {
        setIsExecuting(false);
      }
    },
    [
      orchestratorApi,
      workflowId,
      navigate,
      instanceLink,
      instanceId,
      assessmentId,
    ],
  );

  let pageContent;

  if (loading) {
    pageContent = <Progress />;
  } else if (responseError) {
    pageContent = <ResponseErrorPanel error={responseError} />;
  } else if (!schemaResponse) {
    pageContent = (
      <ResponseErrorPanel
        error={
          new Error('Request for data input schema returned an empty response')
        }
      />
    );
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
            {schemaResponse.schemas.length > 0 ? (
              <StepperForm
                refSchemas={schemaResponse.schemas}
                initialState={schemaResponse.initialState}
                handleExecute={handleExecute}
                disableInitialState={!!assessmentId}
                isExecuting={isExecuting}
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
      noPadding={loading}
      title={schemaResponse?.workflowItem.definition.name || workflowId}
      type="Workflows"
      typeLink="/orchestrator"
    >
      {pageContent}
    </BaseOrchestratorPage>
  );
};
