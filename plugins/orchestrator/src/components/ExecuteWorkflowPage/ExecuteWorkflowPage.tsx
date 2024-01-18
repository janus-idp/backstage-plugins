import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import { Grid } from '@material-ui/core';

import { WorkflowDataInputSchemaResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  executeWorkflowWithBusinessKeyRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { getErrorObject } from '../../utils/errorUtils';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage';
import JsonTextAreaForm from './JsonTextAreaForm';
import StepperForm from './StepperForm';

export const ExecuteWorkflowPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const { businessKey } = useRouteRefParams(
    executeWorkflowWithBusinessKeyRouteRef,
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [updateError, setUpdateError] = React.useState<Error>();
  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);
  const {
    value: schemaResponse,
    loading,
    error: responseError,
  } = useAsync(
    async (): Promise<WorkflowDataInputSchemaResponse> =>
      await orchestratorApi.getWorkflowDataInputSchema(workflowId),
    [orchestratorApi, workflowId],
  );
  const { value: variables } = useAsync(async (): Promise<
    Record<string, JsonValue>[] | undefined
  > => {
    if (businessKey !== undefined) {
      const instance = await orchestratorApi.getInstance(businessKey);
      const vs = instance.variables as Record<string, JsonValue>;
      const response: Record<string, JsonValue>[] = [];
      Object.entries(vs?.workflowdata ?? {}).forEach(([key, value]) => {
        if (key !== 'workflowOptions') response.push({ [key]: value });
      });
      return response;
    }
    return undefined;
  }, [businessKey]);

  const handleExecute = useCallback(
    async (getParameters: () => Record<string, JsonValue>) => {
      setUpdateError(undefined);
      let parameters: Record<string, JsonValue> = {};
      try {
        parameters = getParameters();
      } catch (err) {
        setUpdateError(getErrorObject(err));
        return;
      }
      try {
        if (businessKey !== undefined) {
          parameters.businessKey = businessKey;
        }
        setIsExecuting(true);
        const response = await orchestratorApi.executeWorkflow({
          workflowId,
          parameters,
        });
        navigate(instanceLink({ instanceId: response.id }));
      } catch (err) {
        setUpdateError(getErrorObject(err));
      } finally {
        setIsExecuting(false);
      }
    },
    [orchestratorApi, workflowId, navigate, instanceLink, businessKey],
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
                handleExecute={handleExecute}
                isExecuting={isExecuting}
                initialState={variables}
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
