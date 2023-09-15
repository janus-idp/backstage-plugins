import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import { useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';

import { useController } from '@kie-tools-core/react-hooks/dist/useController';
import { Button, Grid } from '@material-ui/core';

import { definitionsRouteRef, executeWorkflowRouteRef } from '../../routes';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';
import { SWFEditor } from '../SWFEditor';
import { EditorViewKind, SWFEditorRef } from '../SWFEditor/SWFEditor';
import { WorkflowSupportButton } from '../WorkflowSupportButton/WorkflowSupportButton';

export const SWFDefinitionViewerPage = () => {
  const [name, setName] = useState<string>();
  const { swfId, format } = useRouteRefParams(definitionsRouteRef);
  const [swfEditor, swfEditorRef] = useController<SWFEditorRef>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  useEffect(() => {
    if (!swfEditor?.swfItem) {
      return;
    }
    setLoading(false);
    setName(swfEditor.swfItem.definition.name);
  }, [swfEditor]);

  const onExecute = useCallback(() => {
    navigate(executeWorkflowLink({ swfId: swfId }));
  }, [executeWorkflowLink, navigate, swfId]);

  return (
    <BaseWorkflowPage>
      <ContentHeader title="Definition">
        <WorkflowSupportButton />
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
              <SWFEditor
                ref={swfEditorRef}
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
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
