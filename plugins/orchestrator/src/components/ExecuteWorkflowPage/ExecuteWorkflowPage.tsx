import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import { Button, Typography } from '@material-ui/core';
import { withTheme } from '@rjsf/core-v5';
import validator from '@rjsf/validator-ajv8';
import { JSONSchema7 } from 'json-schema';

import {
  workflow_title,
  WorkflowDataInputSchemaResponse,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { WorkflowDialog } from '../WorkflowDialog';
import { EditorViewKind } from '../WorkflowEditor';
import { TitleFieldTemplate } from './TitleFieldTemplate';

const WrappedForm = withTheme(require('@rjsf/material-ui-v5').Theme);

interface ExecuteWorkflowPageProps {
  initialState?: Record<string, JsonValue>;
}

export const ExecuteWorkflowPage = (props: ExecuteWorkflowPageProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const [loading, setLoading] = useState(false);
  const [schemaResponse, setSchemaResponse] =
    useState<WorkflowDataInputSchemaResponse>();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState<boolean>(false);
  const [formState, setFormState] = useState(props.initialState);

  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);

  useEffect(() => {
    setLoading(true);
    orchestratorApi
      .getWorkflowDataInputSchema(workflowId)
      .then(response => {
        setSchemaResponse(response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orchestratorApi, workflowId]);

  const onExecute = useCallback(async () => {
    if (!formState) {
      return;
    }

    const parameters: Record<string, JsonValue> = {};
    for (const key in formState) {
      if (formState.hasOwnProperty(key)) {
        const property = formState[key];
        Object.assign(parameters, property);
      }
    }

    setLoading(true);
    const response = await orchestratorApi.executeWorkflow({
      workflowId,
      parameters,
    });
    setLoading(false);

    navigate(instanceLink({ instanceId: response.id }));
  }, [formState, instanceLink, navigate, orchestratorApi, workflowId]);

  const onFormChanged = useCallback(
    e => setFormState(current => ({ ...current, ...e.formData })),
    [setFormState],
  );

  return (
    <BaseOrchestratorPage>
      <ContentHeader title="Execute">
        <OrchestratorSupportButton />
      </ContentHeader>
      {loading && <Progress />}
      {schemaResponse && (
        <InfoCard
          title={schemaResponse.workflowItem.definition.name ?? workflowId}
          subheader={schemaResponse.workflowItem.definition.description}
          action={
            <>
              <Button
                variant="outlined"
                color="secondary"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={_ => setWorkflowDialogOpen(true)}
              >
                View {workflow_title}
              </Button>
              <WorkflowDialog
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                workflowId={workflowId}
                title={
                  schemaResponse.workflowItem.definition.name ??
                  schemaResponse.workflowItem.definition.id
                }
                open={workflowDialogOpen}
                close={() => setWorkflowDialogOpen(false)}
              />
            </>
          }
        >
          {schemaResponse ? (
            <WrappedForm
              schema={schemaResponse.schema as JSONSchema7}
              validator={validator}
              showErrorList={false}
              onSubmit={onExecute}
              onChange={onFormChanged}
              formData={formState}
              formContext={{ formData: formState }}
              templates={{ TitleFieldTemplate }}
            >
              <Button variant="contained" color="primary" type="submit">
                Execute
              </Button>
            </WrappedForm>
          ) : (
            <Typography>No input schema</Typography>
          )}
        </InfoCard>
      )}
    </BaseOrchestratorPage>
  );
};
