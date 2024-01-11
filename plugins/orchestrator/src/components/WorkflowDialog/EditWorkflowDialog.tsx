import React from 'react';

import { alertApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';

import { useController } from '@kie-tools-core/react-hooks/dist/useController';
import { Button, DialogActions } from '@material-ui/core';

import { orchestratorApiRef } from '../../api';
import SubmitButton from '../SubmitButton/SubmitButton';
import {
  EditorViewKind,
  WorkflowEditorRef,
} from '../WorkflowEditor/WorkflowEditor';
import {
  OrchestratorWorkflowDialogProps,
  WorkflowDialog,
} from './WorkflowDialog';

const EditWorkflowDialog = ({
  name,
  handleSaveSucceeded,
  close,
  ...props
}: Pick<OrchestratorWorkflowDialogProps, 'close' | 'open' | 'workflowId'> & {
  handleSaveSucceeded: () => void;
  name: string;
}) => {
  const errorApi = useApi(errorApiRef);
  const alertApi = useApi(alertApiRef);
  const orchestratorApi = useApi(orchestratorApiRef);
  const [workflowEditor, workflowEditorRef] =
    useController<WorkflowEditorRef>();
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!workflowEditor?.workflowItem) {
      errorApi.post({
        name: 'Unexpected error',
        message: `Workflow editor item undefined`,
      });
      return;
    }
    try {
      const notifications = await workflowEditor.validate();
      if (notifications?.length !== 0) {
        const messages = notifications?.map(n => n.message).join('; ');
        errorApi.post({
          name: 'Validation error',
          message: `The workflow cannot be saved due to: ${messages}`,
        });
        return;
      }
      const content = await workflowEditor?.getContent();
      if (!content) {
        errorApi.post({
          name: 'Validation error',
          message: `No content`,
        });
      }
      setSaving(true);
      const workflowItem = await orchestratorApi.createWorkflowDefinition(
        workflowEditor?.workflowItem?.uri,
        content,
      );
      alertApi.post({
        severity: 'info',
        message: `Workflow ${workflowItem.definition.id} has been saved.`,
        display: 'transient',
      });
      handleSaveSucceeded();
      close();
    } catch (e: any) {
      errorApi.post(new Error(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkflowDialog
      title={`Edit ${name}`}
      kind={EditorViewKind.AUTHORING}
      ref={workflowEditorRef}
      dialogActions={
        <DialogActions>
          <Button variant="outlined" color="primary" onClick={close}>
            Cancel
          </Button>
          <SubmitButton handleClick={() => handleSave()} submitting={saving}>
            Save
          </SubmitButton>
        </DialogActions>
      }
      close={close}
      {...props}
    />
  );
};

export default EditWorkflowDialog;
