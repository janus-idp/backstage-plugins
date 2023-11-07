import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import {
  alertApiRef,
  errorApiRef,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';

import { useController } from '@kie-tools-core/react-hooks/dist/useController';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { workflow_title } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  editWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { WorkflowEditor } from '../WorkflowEditor';
import {
  EditorViewKind,
  WorkflowEditorRef,
} from '../WorkflowEditor/WorkflowEditor';

export const CreateWorkflowPage = () => {
  const { format } = useParams();
  const { workflowId } = useRouteRefParams(editWorkflowRouteRef);
  const [workflowEditor, workflowEditorRef] =
    useController<WorkflowEditorRef>();
  const errorApi = useApi(errorApiRef);
  const alertApi = useApi(alertApiRef);
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const definitionLink = useRouteRef(workflowDefinitionsRouteRef);
  const [loading, setLoading] = useState(false);

  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  const handleResult = useCallback(
    async (content: string) => {
      if (!workflowEditor?.workflowItem) {
        return;
      }

      try {
        const notifications = await workflowEditor.validate();
        if (notifications.length !== 0) {
          const messages = notifications.map(n => n.message).join('; ');
          errorApi.post({
            name: 'Validation error',
            message: `The workflow cannot be saved due to: ${messages}`,
          });
          return;
        }

        setLoading(true);

        const workflowItem = await orchestratorApi.createWorkflowDefinition(
          workflowEditor.workflowItem.uri,
          content,
        );
        if (!workflowItem?.definition.id) {
          errorApi.post(new Error('Error creating workflow'));
          return;
        }

        alertApi.post({
          severity: 'info',
          message: `Workflow ${workflowItem.definition.id} has been saved.`,
        });
        navigate(
          definitionLink({
            workflowId: workflowItem.definition.id,
            format: workflowFormat,
          }),
        );
      } catch (e: any) {
        errorApi.post(new Error(e));
      } finally {
        setLoading(false);
      }
    },
    [
      workflowEditor,
      errorApi,
      orchestratorApi,
      alertApi,
      navigate,
      definitionLink,
      workflowFormat,
    ],
  );

  return (
    <BaseOrchestratorPage>
      <ContentHeader
        title={`Authoring - ${workflowFormat.toLocaleUpperCase('en-US')}`}
      >
        <OrchestratorSupportButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          {loading && <Progress />}
          <InfoCard
            action={
              workflowEditor?.isReady && (
                <Button
                  color="primary"
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  style={{ marginTop: 8, marginRight: 8 }}
                  onClick={() => {
                    workflowEditor?.getContent().then(content => {
                      if (content) {
                        handleResult(content);
                      }
                    });
                  }}
                >
                  Save
                </Button>
              )
            }
            title={workflowId ?? `New ${workflow_title}`}
          >
            <div style={{ height: '600px', padding: '10px' }}>
              <WorkflowEditor
                ref={workflowEditorRef}
                kind={EditorViewKind.AUTHORING}
                workflowId={workflowId}
                format={workflowFormat}
              />
            </div>
          </InfoCard>
        </Grid>
      </Grid>
    </BaseOrchestratorPage>
  );
};
