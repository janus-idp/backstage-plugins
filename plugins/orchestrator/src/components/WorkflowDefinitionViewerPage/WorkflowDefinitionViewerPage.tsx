import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import { useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';

import { useController } from '@kie-tools-core/react-hooks/dist/useController';
import { Button, Grid } from '@material-ui/core';

import {
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import {
  EditorViewKind,
  WorkflowEditor,
  WorkflowEditorRef,
} from '../WorkflowEditor';

export const WorkflowDefinitionViewerPage = () => {
  const [name, setName] = useState<string>();
  const { workflowId, format } = useRouteRefParams(workflowDefinitionsRouteRef);
  const [workflowEditor, workflowEditorRef] =
    useController<WorkflowEditorRef>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  useEffect(() => {
    if (!workflowEditor?.workflowItem) {
      return;
    }
    setLoading(false);
    setName(workflowEditor.workflowItem.definition.name);
  }, [workflowEditor]);

  const onExecute = useCallback(() => {
    navigate(executeWorkflowLink({ workflowId }));
  }, [executeWorkflowLink, navigate, workflowId]);

  return (
    <BaseOrchestratorPage>
      <ContentHeader title="Definition">
        <OrchestratorSupportButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          {loading && <Progress />}
          <InfoCard
            title={name}
            action={
              <Button
                color="primary"
                variant="contained"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={() => onExecute()}
              >
                Execute
              </Button>
            }
          >
            <div style={{ height: '600px' }}>
              <WorkflowEditor
                ref={workflowEditorRef}
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
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
