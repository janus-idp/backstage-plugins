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

import { swfApiRef } from '../../api';
import { definitionsRouteRef, editWorkflowRouteRef } from '../../routes';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';
import { SWFEditor } from '../SWFEditor';
import { EditorViewKind, SWFEditorRef } from '../SWFEditor/SWFEditor';
import { WorkflowSupportButton } from '../WorkflowSupportButton/WorkflowSupportButton';

export const CreateSWFPage = () => {
  const { format } = useParams();
  const { swfId } = useRouteRefParams(editWorkflowRouteRef);
  const [swfEditor, swfEditorRef] = useController<SWFEditorRef>();
  const errorApi = useApi(errorApiRef);
  const alertApi = useApi(alertApiRef);
  const swfApi = useApi(swfApiRef);
  const navigate = useNavigate();
  const definitionLink = useRouteRef(definitionsRouteRef);
  const [loading, setLoading] = useState(false);

  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  const handleResult = useCallback(
    async (content: string) => {
      if (!swfEditor?.swfItem) {
        return;
      }

      try {
        const notifications = await swfEditor.validate();
        if (notifications.length !== 0) {
          const messages = notifications.map(n => n.message).join('; ');
          errorApi.post({
            name: 'Validation error',
            message: `The workflow cannot be saved due to: ${messages}`,
          });
          return;
        }

        setLoading(true);

        const swfItem = await swfApi.createWorkflowDefinition(
          swfEditor.swfItem.uri,
          content,
        );
        if (!swfItem?.definition.id) {
          errorApi.post(new Error('Error creating workflow'));
          return;
        }

        alertApi.post({
          severity: 'info',
          message: `Workflow ${swfItem.definition.id} has been saved.`,
        });
        navigate(
          definitionLink({
            swfId: swfItem.definition.id,
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
      swfEditor,
      errorApi,
      swfApi,
      alertApi,
      navigate,
      definitionLink,
      workflowFormat,
    ],
  );

  return (
    <BaseWorkflowPage>
      <ContentHeader
        title={`Authoring - ${workflowFormat.toLocaleUpperCase('en-US')}`}
      >
        <WorkflowSupportButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          {loading && <Progress />}
          <InfoCard
            action={
              swfEditor?.isReady && (
                <Button
                  color="primary"
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  style={{ marginTop: 8, marginRight: 8 }}
                  onClick={() => {
                    swfEditor?.getContent().then(content => {
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
            title={swfId ?? `New ${workflow_title}`}
          >
            <div style={{ height: '600px', padding: '10px' }}>
              <SWFEditor
                ref={swfEditorRef}
                kind={EditorViewKind.AUTHORING}
                swfId={swfId}
                format={workflowFormat}
              />
            </div>
          </InfoCard>
        </Grid>
      </Grid>
    </BaseWorkflowPage>
  );
};
