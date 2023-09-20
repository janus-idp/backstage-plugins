import React, { useState } from 'react';

import { InfoCard } from '@backstage/core-components';

import { Button } from '@material-ui/core';

import { ProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { Paragraph } from '../Paragraph/Paragraph';
import { WorkflowDialog } from '../WorkflowDialog';
import { EditorViewKind, WorkflowEditor } from '../WorkflowEditor';

interface ProcessGraphViewerProps {
  workflowId: string | undefined;
  selectedInstance: ProcessInstance | undefined;
}

export const ProcessGraphViewer = (props: ProcessGraphViewerProps) => {
  const { workflowId, selectedInstance } = props;
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <InfoCard
        title="Status"
        action={
          workflowId &&
          selectedInstance && (
            <Button
              color="default"
              type="submit"
              variant="outlined"
              style={{ marginTop: 8, marginRight: 8 }}
              onClick={() => setOpen(true)}
            >
              Expand
            </Button>
          )
        }
      >
        <div style={{ height: '500px', padding: '10px' }}>
          {!workflowId || !selectedInstance ? (
            <Paragraph>No instance selected</Paragraph>
          ) : (
            <WorkflowEditor
              kind={EditorViewKind.RUNTIME}
              processInstance={selectedInstance}
              workflowId={workflowId}
            />
          )}
        </div>
      </InfoCard>
      {workflowId && selectedInstance && (
        <WorkflowDialog
          workflowId={workflowId}
          kind={EditorViewKind.RUNTIME}
          processInstance={selectedInstance}
          title={selectedInstance.processName ?? selectedInstance.processId}
          open={open}
          close={() => setOpen(false)}
        />
      )}
    </>
  );
};
